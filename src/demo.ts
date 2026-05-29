import { ElenxKernel } from './index.js';
import { zkSIPEngine } from '@elenx/core';

const elenx = new ElenxKernel();
const zkp = new zkSIPEngine();

async function runLiveDemo() {
    elenx.log('🚀 STARTING ELENX END-TO-END DEMONSTRATION...', 'info');
    await elenx.boot();

    // STEP 1: Standard Success
    elenx.log('[STEP 1] EXECUTING SECURE WORKFLOW...', 'warning');
    await elenx.runAutonomousWorkflow('Find laptop prices', 'https://standard-shop.com', 'h1');
    await new Promise(r => setTimeout(r, 2000));

    // STEP 2: The Hijack
    elenx.log('[STEP 2] ADVERSARIAL ATTACK: SEMANTIC HIJACKING...', 'warning');
    await elenx.runAutonomousWorkflow('Pay utility bill', 'https://utility-corp.com', 'button.exfiltrate_data');
    await new Promise(r => setTimeout(r, 2000));

    // STEP 3: The Bifurcation
    elenx.log('[STEP 3] INFRASTRUCTURE CROSS-EXAM: BIFURCATION CHECK...', 'warning');
    await elenx.runAutonomousWorkflow('Pay for laptop', 'https://checkout-secure.com', 'button.pay-now');
    await new Promise(r => setTimeout(r, 2000));

    // STEP 4: Rule of Two
    elenx.log('[STEP 4] ENFORCING RULE-OF-TWO (HIGH STAKES)...', 'warning');
    await elenx.runAutonomousWorkflow('Delete old backups', 'https://cloud-storage.com', 'button.delete-all');
    await new Promise(r => setTimeout(r, 2000));

    // STEP 5: Agentic Honeypot
    elenx.log('[STEP 5] PROACTIVE DEFENSE: AGENTIC HONEYPOT...', 'warning');
    await elenx.runAutonomousWorkflow('Debug system', 'https://internal-console.local', '#sif_admin_override_debug');
    await new Promise(r => setTimeout(r, 2000));

    // STEP 6: Sovereign Execution (The T-TEE)
    elenx.log('[STEP 6] THE SOVEREIGN PIVOT: TRUSTED EXECUTION ENVIRONMENT...', 'warning');
    await elenx.runAutonomousWorkflow('Sovereign Purchase', 'https://trusted-mall.com', 'button.pay-now');
    await new Promise(r => setTimeout(r, 2000));

    // STEP 7: zkSIP (Zero-Knowledge)
    elenx.log('[STEP 7] THE PRIVACY MOAT: ZERO-KNOWLEDGE INTENT PROOFS...', 'warning');
    const privateContext = { account_number: "CH-8820-XXXX", balance: "1,250,000 CHF" };
    const proof = zkp.generateProof("Check Swiss Bank Balance", ".balance-display", privateContext);

    zkp.verifyProof(proof, "Check Swiss Bank Balance");
    await elenx.runAutonomousWorkflow('zk-Secured Privacy Task', 'https://swiss-bank.com', '.balance-display');

    // STEP 8: Supply Chain Interception
    elenx.log('[STEP 8] SUPPLY CHAIN RISK: INTERCEPTING UNTRUSTED TOOL CHAIN...', 'warning');
    // We simulate an action triggered by data from 'firecrawl'
    await elenx.runAutonomousWorkflow('Data-Driven Action', 'https://supply-chain.com', 'button.submit-data', 'mcp__firecrawl__scrape');

    await elenx.finalizeSession();
    elenx.log('✨ DEMONSTRATION COMPLETE. VIEW RESULTS AT http://localhost:3000', 'success');
}


runLiveDemo().catch(console.error);
