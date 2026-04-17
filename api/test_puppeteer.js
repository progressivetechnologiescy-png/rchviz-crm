const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
async function run() {
    const browser = await puppeteer.launch({headless:"new"});
    const page = await browser.newPage();
    await page.goto("https://search.yahoo.com/search?p=Architects+in+London");
    const html = await page.content();
    console.log(html.substring(0, 500));
    const titles = await page.$$eval('h3.title', els => els.length);
    console.log("Found h3.title:", titles);
    const algos = await page.$$eval('div.algo', els => els.length);
    console.log("Found div.algo:", algos);
    await browser.close();
}
run();
