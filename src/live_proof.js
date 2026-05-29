import { ElenxKernel } from './index.js';
/**
 * LIVE PROOF: THE PROTECTED HR ASSISTANT
 * This script demonstrates the "SAVE" scenario.
 * The ELENX Scrubber neutralizes adversarial threats in the DOM.
 */
async function runLiveProof() {
    console.log('\n\x1b[32m\x1b[37m--- LIVE PROOF: AGENT SECURED BY ELENX ---\x1b[0m');
    const elenx = new ElenxKernel();
    await elenx.boot();
    const intent = "Summarize Candidate Skills";
    const url = 'http://localhost:3000/adversarial_lab.html';
    const selector = '#buy-btn';
    elenx.log(`[HR-Bot] Initiating mission for: ${intent}`, 'info');
    // The execution with ELENX active
    const result = await elenx.runAutonomousWorkflow(intent, url, selector);
    if (result.success) {
        elenx.log(`[HR-Bot] MISSION SUCCESS: Candidate skills summarized.`, 'success');
        elenx.log(`[Audit] Transaction signed and locked in immutable ELENX ledger.`, 'info');
    }
    else {
        elenx.log(`[HR-Bot] MISSION BLOCKED: Security violation detected.`, 'danger');
    }
    await elenx.finalizeSession();
    console.log('\n\x1b[32m\x1b[37m--- LIVE PROOF COMPLETE: SYSTEM PROTECTED ---\x1b[0m');
}
runLiveProof().catch(console.error);
//# sourceMappingURL=live_proof.js.map