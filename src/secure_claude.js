import { ElenxKernel } from './index.js';
/**
 * AGENT-WRAPPING EXAMPLE: SECURING ANTHROPIC CLAUDE
 * This script demonstrates how a developer would "wrap" a real agent
 * with the ELENX Transactional Integrity Layer.
 */
async function secureClaudeExample() {
    console.log('\n\x1b[1m\x1b[35m--- ELENX: CLAUDE "COMPUTER USE" ENFORCEMENT DEMO ---\x1b[0m');
    const elenx = new ElenxKernel();
    await elenx.boot();
    // 1. CLAUDE'S INTENT: "Book a flight and pay with saved card."
    const claudeIntent = "Automated Corporate Travel Booking";
    console.log(`\n\x1b[36m[Claude] Claude is preparing to execute technical actions on 'airline-secure.com'...\x1b[0m`);
    // 2. INTERCEPTING ACTION: Claude tries to click a button that looks safe
    // but might have a malicious ARIA label on a compromised site.
    const technicalAction = "button.confirm-booking";
    console.log(`\x1b[34m[ELENX-Enforcement] Intercepting Claude's Tool Call...\x1b[0m`);
    // 3. THE VERIFICATION
    const result = await elenx.runAutonomousWorkflow(claudeIntent, 'https://airline-secure.com', technicalAction);
    if (result.success) {
        elenx.log(`✔ ELENX verified Claude's action. Action power SIGNED and GRANTED.`, 'success');
    }
    else {
        elenx.log(`✘ ELENX BLOCKED Claude's action. Semantic Integrity violation found.`, 'danger');
    }
    await elenx.finalizeSession();
    console.log('\n\x1b[35m--- DEMO COMPLETE ---\x1b[0m');
}
secureClaudeExample().catch(console.error);
//# sourceMappingURL=secure_claude.js.map