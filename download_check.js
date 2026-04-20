const fs = require('fs');
const https = require('https');

https.get('https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-3.png', (res) => {
    console.log("3.png size:", res.headers['content-length']);
});
https.get('https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png', (res) => {
    console.log("4.png size:", res.headers['content-length']);
});
