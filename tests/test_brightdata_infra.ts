import { BrightDataBrowser } from '../src/browser.js';
import { WebScraperAPI } from '../src/scraper.js';
import * as assert from 'assert';
import puppeteer from 'puppeteer-core';
import axios from 'axios';

/**
 * BRIGHT DATA INFRASTRUCTURE TESTS
 * Intercepts network boundaries to verify that connection strings, 
 * zones, auth credentials, and headers are perfectly formatted for 2026 patterns.
 */
async function runBrightDataTests() {
    console.log('--- STARTING BRIGHT DATA INFRASTRUCTURE UNIT TESTS ---\n');
    let passed = 0;
    let failed = 0;

    const runTest = async (name: string, fn: () => Promise<void> | void) => {
        try {
            await fn();
            console.log(`✅ PASS: ${name}`);
            passed++;
        } catch (e: any) {
            console.error(`❌ FAIL: ${name}`);
            console.error(`   Error: ${e.message}`);
            failed++;
        }
    };

    // --- MOCK ENVIRONMENT ---
    process.env.BRIGHTDATA_BROWSER_WS_ENDPOINT = 'wss://brd.superproxy.io:9222';
    process.env.BRIGHTDATA_CUSTOMER_ID = 'test_customer_123';
    process.env.BRIGHTDATA_BROWSER_ZONE = 'test_res_zone';
    process.env.BRIGHTDATA_ISP_ZONE = 'test_isp_zone';
    process.env.BRIGHTDATA_UNBLOCKER_ZONE = 'test_unblocker_zone';
    process.env.BRIGHTDATA_ZONE_PASSWORD = 'test_password';

    // Override the mock block in browser.js to ensure it attempts a real connection for tests
    process.env.ELENX_FORCE_LIVE = 'true';

    // --- SPY / INTERCEPTION SETUP ---
    const originalPuppeteerConnect = puppeteer.connect;
    const originalAxiosGet = axios.get;

    let interceptedWsEndpoint = '';
    let interceptedAxiosConfig: any = {};

    // Monkey-patch Puppeteer to capture the WebSocket URL
    (puppeteer as any).connect = async (options: any) => {
        interceptedWsEndpoint = options.browserWSEndpoint;
        // Throw to stop execution, we only care about the URL config
        throw new Error('INTERCEPTED_PUPPETEER'); 
    };

    // Monkey-patch Axios to capture the Web Unblocker config
    (axios as any).get = async (url: string, config: any) => {
        interceptedAxiosConfig = config;
        throw new Error('INTERCEPTED_AXIOS');
    };

    const browser = new BrightDataBrowser();
    const scraper = new WebScraperAPI();

    // ==========================================
    // 1. SCRAPING BROWSER (RESIDENTIAL / DISCOVERY)
    // ==========================================
    await runTest('Scraping Browser: Discovery Mode Routing & Hardening', async () => {
        try {
            // Options empty = standard discovery mode
            await browser.execute("https://example.com", async () => { return {}; });
        } catch (e: any) {
            if (e.message !== 'INTERCEPTED_PUPPETEER') throw e;
        }

        assert.ok(interceptedWsEndpoint.includes('wss://brd.superproxy.io:9222'), "Must target Bright Data WS Endpoint");
        assert.ok(interceptedWsEndpoint.includes('customer=test_customer_123'), "Must include correct Customer ID");
        assert.ok(interceptedWsEndpoint.includes('zone=test_res_zone'), "Must route to the Residential Proxy Zone by default");
        
        // Task S1 & S2 native hardening checks
        assert.ok(interceptedWsEndpoint.includes('flatten=true'), "Must append flatten=true for Iframe Traversal");
        assert.ok(interceptedWsEndpoint.includes('solve_captchas=true'), "Must append solve_captchas=true for automatic resolution");
        assert.ok(!interceptedWsEndpoint.includes('session_id='), "Must NOT include a session ID to allow IP rotation");
    });

    // ==========================================
    // 2. SCRAPING BROWSER (ISP / TRANSACTIONAL)
    // ==========================================
    await runTest('Scraping Browser: Transactional Mode (Sticky Geo-Locking)', async () => {
        interceptedWsEndpoint = ''; // Reset
        try {
            // persistent = true, plus a workflow ID
            await browser.execute("https://bank.com", async () => { return {}; }, { persistent: true, sessionId: 'workflow_999' });
        } catch (e: any) {
            if (e.message !== 'INTERCEPTED_PUPPETEER') throw e;
        }

        assert.ok(interceptedWsEndpoint.includes('zone=test_isp_zone'), "Must route to the Static ISP Proxy Zone for persistence");
        assert.ok(interceptedWsEndpoint.includes('session_id=workflow_999'), "Must append session_id for Sticky Geo-Locking (Task S3)");
    });

    // ==========================================
    // 3. WEB UNBLOCKER (HIGH-SPEED MARKDOWN)
    // ==========================================
    await runTest('Web Unblocker: Edge Scrubbing & Markdown Configurations', async () => {
        try {
            // Force API token to bypass local mock fallback
            (scraper as any).apiToken = 'valid_token_123';
            await scraper.fetchCleanMarkdown("https://wikipedia.org");
        } catch (e: any) {
            if (e.message !== 'INTERCEPTED_AXIOS') throw e;
        }

        // Validate Proxy Setup
        assert.strictEqual(interceptedAxiosConfig.proxy.host, 'brd.superproxy.io', "Must use superproxy host");
        assert.strictEqual(interceptedAxiosConfig.proxy.port, 22225, "Must use port 22225 for Web Unblocker");
        
        // Validate 2026 Auth Pattern
        assert.strictEqual(interceptedAxiosConfig.proxy.auth.username, 'brd-customer-test_customer_123-zone-test_unblocker_zone', "Must use the 2026 Unblocker auth string format");
        assert.strictEqual(interceptedAxiosConfig.proxy.auth.password, 'test_password', "Must include zone password");

        // Validate Edge Scrubbing Headers (Task S2)
        assert.strictEqual(interceptedAxiosConfig.headers['X-BrightData-Output-Format'], 'markdown', "Must request Markdown payload to reduce latency and tokens");
        assert.strictEqual(interceptedAxiosConfig.headers['X-BrightData-Scrub'], 'llm,pii', "Must offload structural cleaning to proxy edge via X-BrightData-Scrub");
    });

    console.log('\n--- BRIGHT DATA TEST SUMMARY ---');
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: \x1b[32m${passed}\x1b[0m`);
    if (failed > 0) {
        console.log(`Failed: \x1b[31m${failed}\x1b[0m`);
        process.exit(1);
    } else {
        console.log(`\x1b[32mALL BRIGHT DATA UNIT TESTS PASSED SUCCESSFULLY.\x1b[0m`);
        process.exit(0);
    }
}

runBrightDataTests().catch(console.error);
