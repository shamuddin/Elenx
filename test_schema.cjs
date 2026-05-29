const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting visual test for Schema Tab...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1440, height: 900});

    console.log('Navigating to standalone Fabric page...');
    await page.goto('http://localhost:5173/#fabric', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 4000));
    
    // Check for "No schema configured" message
    await page.evaluate(() => {
        const schemaBtn = document.querySelector('.tab-btn[data-view="schema"]');
        if (schemaBtn) {
            console.log('Found Schema tab, clicking it!');
            schemaBtn.click();
        }
    });

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({path: 'schema_tab_after_fix.png'});

    await browser.close();
    console.log('Schema Test complete!');
})();
