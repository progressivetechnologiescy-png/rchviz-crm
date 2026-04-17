const cheerio = require('cheerio');
fetch("https://search.yahoo.com/search?p=Architects%20in%20Limassol", {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    }
}).then(r => { console.log(r.status); return r.text(); }).then(h => {
    console.log("length:", h.length);
    const $ = cheerio.load(h);
    console.log("algo:", $('div.algo').length);
}).catch(console.error);
