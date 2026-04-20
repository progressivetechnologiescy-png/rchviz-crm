const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeDDGRotate() {
    const industry = "Architects";
    const location = "London";
    const keywords = [
        `${industry} in ${location}`,
        `Top ${industry} ${location}`,
        `${industry} firms ${location}`,
        `${industry} studios ${location}`,
        `Best ${industry} ${location}`
    ];
    
    let allResults = [];
    
    for(const kw of keywords) {
        try {
            console.log(`Searching DDG: ${kw}...`);
            const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(kw)}`;
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            
            const $ = cheerio.load(res.data);
            let count = 0;
            $('.result').each((i, el) => {
                const title = $(el).find('.result__title').text().trim();
                let link = $(el).find('.result__url').attr('href');
                const snippet = $(el).find('.result__snippet').text().trim();
                
                if(link && link.includes('uddg=')) {
                    try {
                        const uddg = new URL('https:' + link).searchParams.get('uddg');
                        if (uddg) link = decodeURIComponent(uddg);
                    } catch(e){}
                }
                
                if(title && link && !link.includes('duckduckgo.com')) {
                    allResults.push({ title, link, snippet });
                    count++;
                }
            });
            console.log(`Found ${count} organically from ${kw}`);
            
            await new Promise(r => setTimeout(r, 1500));
        } catch(e) {
            console.error(`DDG failed for ${kw}:`, e.message);
            if(e.response && e.response.status === 403) {
                 console.log("DDG BLOCKED US!");
                 break;
            }
        }
    }
    
    console.log(`Total raw results: ${allResults.length}`);
    
    // Deduplicate
    const unique = [];
    for(const r of allResults) {
        try {
             const host = new URL(r.link).hostname.replace('www.', '');
             if(!unique.some(u => new URL(u.link).hostname.replace('www.', '') === host)) {
                  unique.push(r);
             }
        } catch(e){}
    }
    
    console.log(`Total UNIQUE results: ${unique.length}`);
    console.log("Samples:", unique.slice(0,3).map(u => u.title));
}

scrapeDDGRotate();
