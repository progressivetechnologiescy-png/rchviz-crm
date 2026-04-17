const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch("http://localhost:3001/api/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ industry: "Architects", location: "London", targetLimit: 3, banned: [] })
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch(e) { console.error(e); }
}
test();
