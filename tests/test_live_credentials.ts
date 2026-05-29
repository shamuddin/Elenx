import * as dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';
import puppeteer from 'puppeteer-core';

// Bright Data acts as an intercepting proxy, so we must allow self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();

/**
 * LIVE CREDENTIALS VERIFICATION
 * Attempts actual network connections using the provided .env configuration
 * to verify if the Bright Data tokens are active and authorized.
 */
async function verifyLiveCredentials() {
    console.log('--- STARTING BRIGHT DATA LIVE CREDENTIAL VERIFICATION ---\n');
    let passed = 0;
    let failed = 0;

    const runTest = async (name: string, fn: () => Promise<void> | void) => {
        try {
            await fn();
            console.log(`✅ PASS: ${name}`);
            passed++;
        } catch (e: any) {
            console.error(`❌ FAIL: ${name}`);
            if (e.response) {
                console.error(`   HTTP Status: ${e.response.status} ${e.response.statusText}`);
                console.error(`   Data:`, e.response.data);
            } else if (e.message.includes('Unexpected server response:')) {
                console.error(`   WebSocket Error: ${e.message}`);
                console.error(`   (A 401 or 407 response indicates invalid credentials or an inactive zone)`);
            } else {
                console.error(`   Error: ${e.message}`);
            }
            failed++;
        }
    };

    const targetUrl = "https://httpbin.org/ip"; // A safe, reliable endpoint to check the outgoing IP

    // ==========================================
    // 1. TEST WEB UNBLOCKER (HTTP Proxy)
    // ==========================================
    await runTest('Web Unblocker Credentials & Zone Status', async () => {
        console.log(`Testing Web Unblocker (Zone: ${process.env.BRIGHTDATA_UNBLOCKER_ZONE})...`);
        const zone = process.env.BRIGHTDATA_UNBLOCKER_ZONE || 'web_unlocker1';
        
        const response = await axios.get(targetUrl, {
            proxy: {
                host: 'brd.superproxy.io',
                port: 33335, // Correct port from screenshot
                auth: {
                    username: `brd-customer-${process.env.BRIGHTDATA_CUSTOMER_ID}-zone-${zone}`,
                    password: process.env.BRIGHTDATA_UNBLOCKER_PASSWORD || ''
                }
            },
            timeout: 15000 // 15s timeout
        });
        
        if (response.status === 200) {
            console.log(`   Success! Outgoing IP: ${response.data.origin}`);
        } else {
            throw new Error(`Unexpected status code: ${response.status}`);
        }
    });

    // ==========================================
    // 2. TEST SCRAPING BROWSER (WebSocket)
    // ==========================================
    await runTest('Scraping Browser Credentials & Zone Status', async () => {
        console.log(`Testing Scraping Browser (Zone: ${process.env.BRIGHTDATA_BROWSER_ZONE})...`);
        const zone = process.env.BRIGHTDATA_BROWSER_ZONE || 'scraping_browser1';
        const password = process.env.BRIGHTDATA_BROWSER_PASSWORD || '';
        const hostPort = (process.env.BRIGHTDATA_BROWSER_WS_ENDPOINT || 'wss://brd.superproxy.io:9222').replace('wss://', '');
        const wsEndpoint = `wss://brd-customer-${process.env.BRIGHTDATA_CUSTOMER_ID}-zone-${zone}:${password}@${hostPort}`;
        
        const browser = await puppeteer.connect({
            browserWSEndpoint: wsEndpoint,
        });

        const page = await browser.newPage();
        const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Increased timeout for remote browser init
        
        if (response && response.ok()) {
            const bodyText = await page.evaluate(() => document.body.innerText);
            console.log(`   Success! Browser rendered content: ${bodyText.trim()}`);
        } else {
             throw new Error(`Failed to load page. Status: ${response?.status()}`);
        }
        
        await browser.close();
    });

    // ==========================================
    // 3. TEST ISP PROXY (HTTP Proxy - Transactional)
    // ==========================================
    await runTest('ISP Proxy Credentials & Zone Status', async () => {
        console.log(`Testing ISP Proxy (Zone: ${process.env.BRIGHTDATA_ISP_ZONE})...`);
        const zone = process.env.BRIGHTDATA_ISP_ZONE || 'isp_proxy1';
        
        const response = await axios.get(targetUrl, {
            proxy: {
                host: 'brd.superproxy.io',
                port: 33335, // Correct port from screenshot
                auth: {
                    username: `brd-customer-${process.env.BRIGHTDATA_CUSTOMER_ID}-zone-${zone}`,
                    password: process.env.BRIGHTDATA_ISP_PASSWORD || ''
                }
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Bypass proxy SSL interception
            timeout: 15000 // 15s timeout
        });
        
        if (response.status === 200) {
            console.log(`   Success! Outgoing IP: ${response.data.origin}`);
        } else {
            throw new Error(`Unexpected status code: ${response.status}`);
        }
    });

    console.log('\n--- LIVE CREDENTIALS SUMMARY ---');
    console.log(`Total Services Tested: ${passed + failed}`);
    console.log(`Authorized & Active: \x1b[32m${passed}\x1b[0m`);
    if (failed > 0) {
        console.log(`Unauthorized or Inactive: \x1b[31m${failed}\x1b[0m`);
        console.log('\n\x1b[33mACTION REQUIRED: Please verify your Bright Data Dashboard to ensure the zones are active and the password/token is correct for Customer ID: ' + process.env.BRIGHTDATA_CUSTOMER_ID + '\x1b[0m');
        process.exit(1);
    } else {
        console.log(`\x1b[32mALL BRIGHT DATA SERVICES ARE LIVE AND AUTHORIZED.\x1b[0m`);
        process.exit(0);
    }
}

verifyLiveCredentials().catch(console.error);