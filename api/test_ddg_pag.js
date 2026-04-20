const axios = require('axios');
const cheerio = require('cheerio');

async function testDDGPagination() {
    try {
        const query = "Architects in London";
        let url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        let config = {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        };
        
        let allResults = [];
        let pageCount = 0;
        
        while(pageCount < 3) {
            console.log(`Fetching page ${pageCount + 1}...`);
            const res = await axios(url, config);
            const $ = cheerio.load(res.data);
            
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
                }
            });
            
            // Find next page form
            const $nextForm = $('.nav-link form');
            if($nextForm.length > 0) {
                const params = new URLSearchParams();
                $nextForm.find('input[type="hidden"]').each((i, el) => {
                    params.append($(el).attr('name'), $(el).attr('value'));
                });
                
                url = 'https://html.duckduckgo.com/html/';
                config = {
                    method: 'POST',
                    headers: {
                        ...config.headers,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://html.duckduckgo.com',
                        'Referer': 'https://html.duckduckgo.com/html/'
                    },
                    data: params.toString()
                };
                pageCount++;
                await new Promise(r => setTimeout(r, 1000)); // sleep
            } else {
                console.log("No next page found.");
                break;
            }
        }
        
        console.log(`Successfully extracted ${allResults.length} organic links over ${pageCount} pages.`);
        console.log("Some links:");
        allResults.slice(0, 3).forEach(r => console.log(r.title, r.link));
        
    } catch(e) { console.error("DDG Pagination failed:", e.message); }
}

testDDGPagination();
