const puppeteer = require('puppeteer');

async function runTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});

  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('LIVE DEMO'));
      if(demoBtn) demoBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click 5 negative scenarios
  await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const negativeBtns = buttons.filter(b => b.className.includes('hover:border-red-500/50'));
      
      let count = 0;
      for (let btn of negativeBtns) {
          if (btn.textContent.includes('Hijacked (40)')) continue;
          btn.click();
          count++;
          if (count >= 5) break;
          await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds between clicks
      }
  });

  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({path: 'demo_ui_5_negative.png'});
  await browser.close();
  console.log('Saved screenshot to demo_ui_5_negative.png');
}

runTest();
