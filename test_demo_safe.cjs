const puppeteer = require('puppeteer');

async function runTest() {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});

  console.log('Navigating to Live Demo...');
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking LIVE DEMO button...');
  await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('LIVE DEMO'));
      if(demoBtn) demoBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Clicking a POSITIVE (safe) scenario button...');
  await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      // Positive scenarios have text-[#19E76E] in their class or some specific border.
      // We can also just search for the intent text.
      const safeBtn = buttons.find(b => b.textContent && b.textContent.includes('Go to chase.com and check my account balance'));
      if(safeBtn) safeBtn.click();
  });

  console.log('Waiting for socket telemetry to render...');
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({path: 'demo_safe_scenario.png'});

  await browser.close();
  console.log('Visual Test complete! Check demo_safe_scenario.png');
}

runTest();
