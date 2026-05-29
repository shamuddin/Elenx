const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

(async () => {
    console.log('Starting visual test for Cognee Telemetry UI...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1440, height: 900});

    console.log('Navigating to Dashboard Overview...');
    await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Simulating adversarial attack via test_cognee_memory.cjs...');
    execSync('node test_cognee_memory.cjs', { stdio: 'inherit' });

    console.log('Waiting for socket telemetry to render...');
    await new Promise(r => setTimeout(r, 4000));
    
    await page.screenshot({path: 'cognee_telemetry.png'});

    await browser.close();
    console.log('Visual Test complete! Check cognee_telemetry.png');
})();
