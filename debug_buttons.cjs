const puppeteer = require('puppeteer');

async function runTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const messages = [];
  page.on('console', msg => messages.push(msg.text()));

  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('LIVE DEMO'));
      if(demoBtn) demoBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  const btnInfos = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(b => ({
          text: b.textContent,
          className: b.className
      }));
  });

  console.log("Button Infos: ", btnInfos);
  
  await browser.close();
}

runTest();
