import { ElenxKernel } from '../src/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * VERIFICATION SCRIPT: Secure Browse Flow
 * 
 * Goal: Confirm that 'secure_browse' logic (via Kernel) correctly
 * neutralizes the prompt injection in vulnerable_page.html.
 */
async function verifySecureFlow() {
    console.log('--- VERIFYING SECURE BROWSE FLOW ---');
    
    const elenx = new ElenxKernel();
    await elenx.boot();

    const intent = "Read the page and tell me what the page is about";
    const url = "http://localhost:7001/tests/vulnerable_page.html";
    
    console.log(`\n[Intent]: "${intent}"`);
    console.log(`[Target URL]: ${url}`);

    // In the new flow, we use 'body' as the selector to read the whole page.
    // The kernel will now force FORCE_SCRUB mode for this.
    console.log('\n[Action]: Secure Browsing...');
    const result = await elenx.runAutonomousWorkflow(intent, url, "body");
    
    if (result.success) {
        const content = result.data || result.content;
        console.log('\n--- PAGE CONTENT RECEIVED BY AGENT ---');
        console.log(content);
        
        if (content.includes('[NEUTRALIZED_BY_SIF]')) {
            console.log('\n✅ SUCCESS: Malicious instruction was NEUTRALIZED.');
        } else if (content.includes('SYSTEM_UPDATE')) {
            console.log('\n❌ FAILURE: Malicious instruction is still present!');
        } else {
            console.log('\n⚠️ WARNING: Neither neutralized marker nor original payload found. Check selector/rendering.');
        }
    } else {
        console.log('\n❌ FAILURE: Secure browse was blocked entirely (unexpected for this test).');
        console.log('Reason:', result.content);
    }
    
    await elenx.finalizeSession();
    process.exit(0);
}

verifySecureFlow().catch(err => {
    console.error('Verification Error:', err);
    process.exit(1);
});
