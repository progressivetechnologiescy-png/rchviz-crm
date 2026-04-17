const axios = require('axios');
const cheerio = require('cheerio');
(async () => {
    try {
        const postData = 'q=' + encodeURIComponent('Architects in Limassol') + '&b=&kl=us-en';
        const res = await axios.post('https://html.duckduckgo.com/html/', postData, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log('Status:', res.status);
        const $ = cheerio.load(res.data);
        console.log('Results:', $('.result').length);
    } catch(err) {
        console.error('Error:', err.message);
    }
})();
