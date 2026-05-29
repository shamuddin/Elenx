import puppeteer from 'puppeteer-core';
import os from 'os';

function getChromePath() {
    if (os.platform() === 'win32') {
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }
    return '/usr/bin/google-chrome';
}

async function run() {
    const browser = await puppeteer.launch({ executablePath: getChromePath(), headless: true });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    
    const rootStyles = await page.evaluate(() => {
        const el = document.querySelector('.min-h-screen');
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
            minHeight: styles.minHeight,
            display: styles.display,
            backgroundColor: styles.backgroundColor
        };
    });
    
    console.log('Root Element Computed Styles:', rootStyles);
    
    const glassPanels = await page.evaluate(() => {
        const els = document.querySelectorAll('.glass-panel');
        if (els.length === 0) return 0;
        const styles = window.getComputedStyle(els[0]);
        return {
            count: els.length,
            backgroundColor: styles.backgroundColor,
            backdropFilter: styles.backdropFilter,
            borderColor: styles.borderColor
        };
    });
    
    console.log('Glass Panel Styles:', glassPanels);
    
    const cyberText = await page.evaluate(() => {
        const el = document.querySelector('.text-cyber-accent');
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
            color: styles.color
        };
    });
    console.log('Cyber Accent Color:', cyberText);

    await browser.close();
}

run();
