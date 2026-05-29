const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting visual test to debug Cognee controls...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1440, height: 900});

    console.log('Navigating to standalone Fabric page...');
    await page.goto('http://localhost:5173/#fabric', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 4000));
    
    // Take screenshot of controls BEFORE clicking Heatmap
    await page.screenshot({path: 'controls_before.png'});

    await page.evaluate(() => {
        const heatmapBtn = document.querySelector('.ctrl-btn[data-layer="heatmap"]');
        if (heatmapBtn) heatmapBtn.click();
    });

    // Wait 6 seconds to let the interval run
    console.log('Waiting 6 seconds...');
    await new Promise(r => setTimeout(r, 6000));

    // Take screenshot AFTER clicking Heatmap AND waiting for the refresh interval
    await page.screenshot({path: 'controls_after.png'});

    await browser.close();
    console.log('Test complete!');
})();
