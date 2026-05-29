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

  // Get all safe scenarios and click them one by one
  const safeButtonsClicked = await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      // positive scenarios have text-[#19E76E] in their industry badge
      // or we can find them by border color hover:border-[#19E76E]/50
      const safeBtns = buttons.filter(b => b.className.includes('hover:border-[#19E76E]/50') || b.className.includes('text-[#19E76E]'));
      
      let count = 0;
      for (let btn of safeBtns) {
          // ignore the filter buttons
          if (btn.textContent.includes('Safe (60)')) continue;
          
          btn.click();
          count++;
          await new Promise(r => setTimeout(r, 1000));
      }
      return count;
  });

  console.log(`Clicked ${safeButtonsClicked} safe buttons.`);
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
}

runTest();
