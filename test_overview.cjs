const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Set a wider viewport to test the 30/70 split
    await page.setViewport({width: 1600, height: 900});
    await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
    
    // Click Initialize Platform
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('INITIALIZE PLATFORM'));
        if (btn) btn.click();
    });
    
    // Wait for the UI to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Take a screenshot of the Overview
    await page.screenshot({path: 'overview_tab.png'});
    
    // Now trigger an event to populate the graph with "unknown_domain" to verify the fix
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        // Find one of the Live Proof buttons (e.g. Healthcare)
        const btn = btns.find(b => b.textContent.includes('Live Proof'));
        if (btn) btn.click();
    });
    
    // Wait for event to populate
    await new Promise(r => setTimeout(r, 2000));
    
    // Go to Knowledge Fabric tab to see the updated graph
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Knowledge Fabric') || b.textContent.includes('KNOWLEDGE FABRIC'));
        if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({path: 'fabric_updated.png'});

    // Go to the standalone fabric route
    await page.goto('http://localhost:5173/#fabric', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({path: 'fabric_standalone.png'});
    
    await browser.close();
})();
