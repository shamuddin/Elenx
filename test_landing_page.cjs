const puppeteer = require('puppeteer');

async function runTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({path: 'landing_page_react_test.png'});
  await browser.close();
  console.log('Saved screenshot to landing_page_react_test.png');
}

runTest();
