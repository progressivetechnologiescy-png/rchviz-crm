const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:5174/dashboard');
  await page.waitForSelector('.dashboard-container', { timeout: 3000 }).catch(() => console.log('Timeout waiting for container, likely crashed.'));
  await page.waitForTimeout(1000);
  await browser.close();
})();
