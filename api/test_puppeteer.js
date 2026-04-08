const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function test() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=Architects+in+Limassol&hl=en');
    
    const html = await page.content();
    console.log(html.substring(0, 1000));
    console.log(html.includes('Before you continue'));
    console.log(html.includes('did not match any documents'));
    
    await browser.close();
}
test();
