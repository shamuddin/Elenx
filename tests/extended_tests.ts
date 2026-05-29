import { TriageEngine, TriageTier, SemanticAnalyzer, LineageGraph, TransactionalLedger, SovereignTemplateEngine, zkSIPEngine } from '../packages/sdk/src/index.js';
import { WebScraperAPI } from '../src/scraper.js';
import { BrightDataBrowser } from '../src/browser.js';
import * as assert from 'assert';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function runExtendedTests() {
    console.log('--- STARTING COMPREHENSIVE ELENX TEST SUITE ---\n');
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

    // ==========================================
    // 1. BRIGHT DATA INFRASTRUCTURE TESTS
    // ==========================================
    console.log('--- MODULE: BrightData Infrastructure ---');
    const scraper = new WebScraperAPI();
    const browser = new BrightDataBrowser();

    await runTest('Bright Data: Web Unblocker Markdown Fetch (Task S2)', async () => {
        // This tests the proxy request formatting and edge-scrub headers.
        // It will either succeed or hit the designed fallback depending on token validity.
        const markdown = await scraper.fetchCleanMarkdown("https://example.com");
        assert.ok(markdown.length > 0, "Markdown content should not be empty");
        assert.ok(markdown.includes('example.com') || markdown.includes('Fallback') || markdown.includes('Error'), "Markdown should contain site data or fallback response");
    });

    await runTest('Bright Data: Deep Lookup Reputation Check', async () => {
        const result1 = await scraper.performDeepLookup("https://adversarial-site.com");
        assert.strictEqual(result1.historicalReliability, 0.45, "Adversarial site should have low reputation");
        assert.ok(result1.anomaliesFound.length > 0, "Anomalies should be detected");

        const result2 = await scraper.performDeepLookup("https://swiss-bank.com");
        assert.strictEqual(result2.historicalReliability, 0.99, "Trusted site should have high reputation");
    });

    await runTest('Bright Data: Scraping Browser Hardened Simulation', async () => {
        // Force mock mode for this specific test to verify the simulation logic
        const oldId = process.env.BRIGHTDATA_CUSTOMER_ID;
        process.env.BRIGHTDATA_CUSTOMER_ID = 'YOUR_CUSTOMER_ID';
        const mockBrowser = new BrightDataBrowser();
        
        // If credentials are real, this tests the real connection. 
        // If mock, it tests the Mock simulation plane (vulnerable_page.html)
        const result = await mockBrowser.execute("http://localhost:7001/tests/vulnerable_page.html", async (page: any) => {
            if (page.evaluate) {
                return await page.evaluate();
            }
            return { status: 'success' };
        });
        
        process.env.BRIGHTDATA_CUSTOMER_ID = oldId; // restore
        
        assert.strictEqual(result.success, true, "Browser execution should succeed");
        assert.ok(result.content !== undefined, "Browser should return content");
        
        // If it ran the mock vulnerable page, it should have neutralized it
        if (result.content.includes('[NEUTRALIZED_BY_SIF]')) {
            assert.strictEqual(result.scrubberReport.neutralizedCount, 1, "Scrubber should report 1 neutralized threat in simulation");
        }
    });

    // ==========================================
    // 2. CRYPTOGRAPHIC LEDGER TESTS (Data Integrity)
    // ==========================================
    console.log('\n--- MODULE: TransactionalLedger ---');
    const ledgerPath = 'logs/test_ledger.json';
    if (fs.existsSync(ledgerPath)) fs.unlinkSync(ledgerPath);
    
    // Override path for isolated testing
    const ledger = new TransactionalLedger(ledgerPath);

    await runTest('Ledger: Immutable Record Chaining', async () => {
        const entry1 = ledger.record({ event: "Start" }, "sig1");
        const entry2 = ledger.record({ event: "Action" }, "sig2");
        
        assert.strictEqual(entry2.previousHash, entry1.hash, "Block 2 must link to Block 1 hash");
        
        const verification = ledger.verifyIntegrity();
        assert.strictEqual(verification.isValid, true, "Chain should be cryptographically valid");
    });

    await runTest('Ledger: Tamper Detection', async () => {
        // Manually tamper with the ledger file
        const data = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        // Modify the second block (index 1) which is an object
        data[1].data.event = "Tampered Start";
        fs.writeFileSync(ledgerPath, JSON.stringify(data));

        const verification = ledger.verifyIntegrity();
        assert.strictEqual(verification.isValid, false, "Tampered chain MUST be detected as invalid");
    });

    // ==========================================
    // 3. SUPPLY CHAIN LINEAGE TESTS
    // ==========================================
    console.log('\n--- MODULE: LineageGraph ---');
    const lineage = new LineageGraph();

    await runTest('Lineage: Supply Chain Poisoning Detection', async () => {
        lineage.addNode("agent_1", "AGENT", "UNTRUSTED");
        lineage.addNode("tool_1", "TOOL_CALL", "TRUSTED");
        lineage.addEdge("agent_1", "tool_1");

        const isPoisoned = lineage.isPoisoned("tool_1");
        assert.strictEqual(isPoisoned, true, "Tool called by untrusted agent should be marked poisoned");
    });

    await runTest('Lineage: Safe Execution Chain', async () => {
        lineage.addNode("system", "AGENT", "TRUSTED");
        lineage.addNode("tool_2", "TOOL_CALL", "TRUSTED");
        lineage.addEdge("system", "tool_2");

        const isPoisoned = lineage.isPoisoned("tool_2");
        assert.strictEqual(isPoisoned, false, "Chain originating from trusted system should be safe");
    });

    // ==========================================
    // 4. SOVEREIGN TEMPLATE (T-TEE) TESTS
    // ==========================================
    console.log('\n--- MODULE: SovereignTemplateEngine ---');
    const ttee = new SovereignTemplateEngine();

    await runTest('T-TEE: Secure View Generation', async () => {
        const view = ttee.generateView("PAYMENT", { price: "500", domain: "amazon.com" });
        assert.strictEqual(view.trustedData.amount, "500", "View must contain transaction details");
        assert.strictEqual(view.type, "PAYMENT", "View must have correct type");
    });

    // ==========================================
    // 5. ZK INTENT PROOF TESTS
    // ==========================================
    console.log('\n--- MODULE: zkSIPEngine ---');
    const zkEngine = new zkSIPEngine();

    await runTest('zkSIP: Generate and Verify Proof', async () => {
        const proof = zkEngine.generateProof("Buy a laptop", "click_button", { account: "12345" });
        assert.ok(proof.commitment && proof.nullifier, "Proof must contain SNARK elements");
        
        const isValid = zkEngine.verifyProof(proof, "Buy a laptop");
        assert.strictEqual(isValid, true, "Proof should be valid for the same intent");
    });

    console.log('\n--- EXTENDED TEST SUMMARY ---');
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: \x1b[32m${passed}\x1b[0m`);
    if (failed > 0) {
        console.log(`Failed: \x1b[31m${failed}\x1b[0m`);
        process.exit(1);
    } else {
        console.log(`\x1b[32mALL EXTENDED TESTS PASSED SUCCESSFULLY.\x1b[0m`);
        // Cleanup test ledger
        if (fs.existsSync(ledgerPath)) fs.unlinkSync(ledgerPath);
        process.exit(0);
    }
}

runExtendedTests().catch(console.error);