const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeDDG() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Broad search for real tweets
    const query = encodeURIComponent(`site:twitter.com/i/web/status ("looking for" OR "hiring") ("3D artist" OR "archviz" OR "3D modeler")`);
    const searchUrl = `https://duckduckgo.com/?q=${query}&kl=wt-wt&ia=web`;
    
    console.log("Navigating to:", searchUrl);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const webResults = await page.evaluate(() => {
        const results = [];
        const links = document.querySelectorAll('[data-testid="result-snippet"]');
        const titles = document.querySelectorAll('[data-testid="result-title-a"]');
        
        titles.forEach((titleNode, index) => {
            let title = titleNode.innerText.trim();
            let url = titleNode.href;
            
            if (url.includes('uddg=')) {
                try {
                    const uddg = new URL(url).searchParams.get('uddg');
                    if (uddg) url = decodeURIComponent(uddg);
                } catch (e) { }
            }
            
            if (url.includes('twitter.com') || url.includes('x.com')) {
                const snippet = links[index] ? links[index].innerText.trim() : '';
                
                let handle = "Unknown User";
                const handleMatch = title.match(/\(@([A-Za-z0-9_]+)\)/);
                if (handleMatch) {
                    handle = `@${handleMatch[1]}`;
                } else {
                    const nameMatch = title.split(' on X:')[0].split(' on Twitter:')[0];
                    if (nameMatch) handle = nameMatch;
                }
                
                // Clean URL
                const cleanUrl = url.split('?')[0];
                
                results.push({
                    handle: handle,
                    content: snippet,
                    tweetUrl: cleanUrl
                });
            }
        });
        return results;
    });
    
    console.log(JSON.stringify(webResults, null, 2));
    await browser.close();
}

scrapeDDG();
