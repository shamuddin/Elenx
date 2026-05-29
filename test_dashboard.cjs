const puppeteer = require('puppeteer'); 
(async () => { 
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage(); 
  await page.setViewport({width: 1280, height: 800}); 
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'}); 
  
  // Click "INITIALIZE PLATFORM"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('INITIALIZE PLATFORM'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2000)); 
  await page.screenshot({path: 'dashboard.png'}); 
  await browser.close(); 
})();
