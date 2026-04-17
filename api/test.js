const axios = require('axios');
(async () => {
    try {
        const res = await axios.get('https://www.ask.com/web?q=' + encodeURIComponent('Architects in Limassol'), {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const match = res.data.match(/window\.MESON\.initialState\s*=\s*(\{.*?\});/);
        if (match) {
            const data = JSON.parse(match[1]);
            const results = data.search?.webResults?.results || [];
            console.log('Results mapped:', results.length);
            if (results.length > 0) {
                console.log(results[0].title);
                console.log(results[0].url);
                console.log(results[0].abstract);
            }
        }
    } catch(err) { console.log('Error:', err.message); }
})();
