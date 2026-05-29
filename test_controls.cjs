const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting browser test to debug Cognee controls...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1440, height: 900});

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('Navigating to standalone Fabric page...');
    await page.goto('http://localhost:5173/#fabric', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 4000));
    
    // Check if controls are visible and try clicking one
    await page.evaluate(() => {
        const heatmapBtn = document.querySelector('.ctrl-btn[data-layer="heatmap"]');
        if (heatmapBtn) {
            console.log('Found Heatmap button, clicking it!');
            heatmapBtn.click();
        } else {
            console.log('Heatmap button not found!');
        }
    });

    await new Promise(r => setTimeout(r, 2000));

    await browser.close();
    console.log('Test complete!');
})();
