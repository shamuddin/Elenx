const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting browser test...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1440, height: 900});

    console.log('Navigating to landing page...');
    await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
    
    console.log('Clicking INITIALIZE PLATFORM...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('INITIALIZE PLATFORM'));
        if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    console.log('Taking screenshot of Live Demo Overview...');
    await page.screenshot({path: 'browser_test_overview.png'});

    // Verify the "Protected by Cognee Memory" badge exists
    const hasBadge = await page.evaluate(() => {
        return document.body.innerHTML.includes('PROTECTED BY COGNEE MEMORY');
    });
    console.log('Has Cognee Badge:', hasBadge);

    // Verify the Open in New Tab link exists
    const hasNewTabLink = await page.evaluate(() => {
        return document.body.innerHTML.includes('Open in New Tab');
    });
    console.log('Has New Tab Link:', hasNewTabLink);

    // Test clicking a Threat Scenario
    console.log('Simulating an attack scenario...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Live Proof'));
        if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 3000));

    console.log('Clicking Knowledge Fabric tab...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Knowledge Fabric') || b.textContent.includes('KNOWLEDGE FABRIC'));
        if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 3000));
    console.log('Taking screenshot of Knowledge Fabric...');
    await page.screenshot({path: 'browser_test_fabric.png'});

    console.log('Navigating to standalone Fabric page...');
    await page.goto('http://localhost:5173/#fabric', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 3000));
    console.log('Taking screenshot of standalone Fabric...');
    await page.screenshot({path: 'browser_test_standalone_fabric.png'});

    await browser.close();
    console.log('Browser test complete!');
})();
