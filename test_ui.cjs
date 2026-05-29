const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        
        console.log('Taking initial screenshot...');
        await page.screenshot({ path: 'initial.png' });
        
        console.log('Clicking Healthcare Positive scenario...');
        // Find the scenario button to click.
        // It might be nested inside a list of scenarios. We'll evaluate and click a button containing the text "Healthcare - Positive".
        
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const healthcareButton = buttons.find(b => b.textContent && b.textContent.includes('Healthcare') && b.textContent.includes('Positive'));
            if (healthcareButton) {
                healthcareButton.click();
            } else {
                // If specific button not found, click the first positive scenario
                const firstPositive = buttons.find(b => b.textContent && b.textContent.includes('Check Account Balance'));
                if (firstPositive) firstPositive.click();
            }
        });
        
        console.log('Waiting for telemetry and graph to update...');
        // Wait for graph and telemetry to update
        await new Promise(r => setTimeout(r, 10000));
        
        console.log('Taking after_click screenshot...');
        await page.screenshot({ path: 'after_click.png' });
        
        await browser.close();
        console.log('Done!');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
