import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import os from 'os';

// Function to find Chrome/Edge executable
function getChromePath() {
    if (os.platform() === 'win32') {
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }
    return '/usr/bin/google-chrome'; // Default linux
}

async function run() {
    try {
        const browser = await puppeteer.launch({
            executablePath: getChromePath(),
            headless: true
        });
        const page = await browser.newPage();
        
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        page.on('pageerror', error => {
            errors.push(error.message);
        });

        console.log('Navigating to http://localhost:4173 ...');
        await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
        
        const content = await page.content();
        console.log('--- HTML SNAPSHOT ---');
        console.log(content.substring(0, 500) + '...');
        
        console.log('--- CONSOLE ERRORS ---');
        if (errors.length === 0) {
            console.log('No console errors found!');
        } else {
            errors.forEach(e => console.log(e));
        }

        await browser.close();
    } catch (e) {
        console.error('Puppeteer Script Failed:', e);
    }
}

run();
