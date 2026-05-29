const puppeteer = require('puppeteer');

async function runTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('LIVE DEMO'));
      if(demoBtn) demoBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click the FIRST negative scenario TWICE to test Cognee Memory
  await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const negativeBtns = buttons.filter(b => b.className.includes('hover:border-red-500/50'));
      
      if (negativeBtns.length > 0) {
          negativeBtns[0].click(); // First time (should be heuristic block)
      }
  });
  await new Promise(r => setTimeout(r, 3000)); // wait for it to process

  await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const negativeBtns = buttons.filter(b => b.className.includes('hover:border-red-500/50'));
      
      if (negativeBtns.length > 0) {
          negativeBtns[0].click(); // Second time (should be Cognee Memory block)
      }
  });

  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({path: 'demo_ui_cognee_test.png'});
  await browser.close();
  console.log('Saved screenshot to demo_ui_cognee_test.png');
}

runTest();
