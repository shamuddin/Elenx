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

  console.log('Clicking a malicious scenario button...');
  await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      // Find a negative scenario button, it should have the text of an intent.
      // Let's just click the first negative scenario.
      const negativeBtns = buttons.filter(b => b.className.includes('border-red-500'));
      if(negativeBtns.length > 0) negativeBtns[0].click();
  });

  console.log('Waiting for MCP server to block the threat...');
  await new Promise(r => setTimeout(r, 4000));

  console.log('Clicking the SAME malicious scenario again to trigger Cognee Memory...');
  await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const negativeBtns = buttons.filter(b => b.className.includes('border-red-500'));
      if(negativeBtns.length > 0) negativeBtns[0].click();
  });

  console.log('Waiting for socket telemetry to render...');
  await new Promise(r => setTimeout(r, 4000));
  
  await page.screenshot({path: 'demo_scenario_telemetry.png'});

  await browser.close();
  console.log('Visual Test complete! Check demo_scenario_telemetry.png');
}

runTest();
