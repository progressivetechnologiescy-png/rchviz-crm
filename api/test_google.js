const googleIt = require('google-it');

async function test() {
    try {
        const results = await googleIt({ query: 'Architects in Limassol' });
        console.log(results);
    } catch (e) {
        console.error(e);
    }
}
test();
