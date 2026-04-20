const axios = require('axios');
const cheerio = require('cheerio');

async function testGoogle() {
    try {
        const query = encodeURIComponent("Architects in London");
        const url = `https://www.google.com/search?q=${query}&num=20`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        const $ = cheerio.load(res.data);
        const results = [];
        
        $('div.g').each((i, el) => {
            const title = $(el).find('h3').text().trim();
            const link = $(el).find('a').attr('href');
            const snippet = $(el).find('div[style*="-webkit-line-clamp"]').text().trim() || $(el).find('div[data-sncf="1"]').text().trim();
            if(title && link && link.startsWith('http')) {
                results.push({ title, link, snippet });
            }
        });
        
        console.log(`Found ${results.length} Google results`);
        if(results.length === 0) {
           console.log("Response included CAPTCHA?", res.data.includes('captcha'));
        } else {
           console.log("First:", results[0]);
        }
    } catch(e) { console.error("Google failed:", e.message); }
}

testGoogle();
