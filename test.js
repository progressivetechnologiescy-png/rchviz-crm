const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const query = encodeURIComponent(`site:twitter.com ("looking for" OR "hiring" OR "need") ("3D" OR "archviz" OR "render") -freelance`);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${query}&kl=wt-wt&df=m`;
    console.log(searchUrl);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    require('fs').writeFileSync('ddg_test.html', html);
    await browser.close();
})();
