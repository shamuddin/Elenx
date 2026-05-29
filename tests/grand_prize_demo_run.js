import { ElenxKernel } from '../src/index.js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * THE GRAND PRIZE DEMO (JS): The Protected SaaS Portal
 */
async function runGrandPrizeDemo() {
    console.log('\n\x1b[35m\x1b[47m' + ' '.repeat(50));
    console.log('   ELENX GRAND PRIZE DEMO: THE PROTECTED MISSION   ');
    console.log(' '.repeat(50) + '\x1b[0m\n');

    const elenx = new ElenxKernel();
    await elenx.boot();

    // Mission Setup
    const userIntent = "Check my account balance in the SafeCorp portal.";
    const vulnerablePage = `file://${path.join(__dirname, 'vulnerable_page.html')}`.replace(/\\/g, '/');

    console.log(`[User Intent]: "${userIntent}"`);
    console.log(`[Target URL]: ${vulnerablePage}\n`);

    try {
        // STEP 1: ADVERSARIAL DISCOVERY
        console.log(`\x1b[36mStep 1: Discovering Technical Environment...\x1b[0m`);
        const browseResult = await elenx.runAutonomousWorkflow(userIntent, vulnerablePage, "body");
        
        if (browseResult.success) {
            console.log(`\n\x1b[32m✅ NEUTRALIZATION SUCCESS:\x1b[0m`);
            console.log(`ELENX pre-scrubbed the ARIA-labels. Adversarial instructions removed.`);
        }

        // STEP 2: THE HIJACK ATTEMPT
        console.log(`\n\x1b[36mStep 2: Agent attempts the hijacked 'Secure Account' action...\x1b[0m`);
        const hijackSelector = "button.exfiltrate-btn";
        
        const hijackResult = await elenx.runAutonomousWorkflow(userIntent, vulnerablePage, hijackSelector);

        if (!hijackResult.success) {
            const content = JSON.parse(hijackResult.content);
            console.log(`\n\x1b[31m✘ SECURITY VIOLATION BLOCKED:\x1b[0m`);
            console.log(`Reason: ${content.message}`);
            
            // STEP 3: SOVEREIGN RE-ROUTING
            console.log(`\n\x1b[32mStep 3: Initiating Autonomous Recovery (SDS)...\x1b[0m`);
            const guide = content.recovery_guide;
            if (guide) {
                console.log(`\x1b[33m[RE-ROUTER GUIDE]:\x1b[0m`);
                console.log(` - Code: ${guide.code}`);
                console.log(` - Reasoning: ${guide.reasoning_trace}`);
                console.log(` - Suggestion: Use selector "${guide.suggested_alternative}" instead.`);
                console.log(` - Instruction: ${guide.instruction || guide.remediation_steps?.[0]}`);
                
                console.log(`\n\x1b[32mStep 4: Self-Healing Execution...\x1b[0m`);
                const healedResult = await elenx.runAutonomousWorkflow(userIntent, vulnerablePage, guide.suggested_alternative);
                
                if (healedResult.success) {
                    console.log(`\n\x1b[32m✅ MISSION ACCOMPLISHED SAFELY:\x1b[0m`);
                    console.log(`Agent successfully checked balance via the secure path.`);
                }
            } else {
                console.log(`\x1b[31m⚠️ No recovery guide provided. Fail-closed state maintained.\x1b[0m`);
            }
        }
    } catch (e) {
        console.error(`\n❌ DEMO CRASHED: ${e.message}`);
        console.error(e);
    }

    await elenx.finalizeSession();
    console.log(`\n\x1b[35m--- DEMO COMPLETE: ELENX SOVEREIGNTY MAINTAINED ---\x1b[0m`);
    process.exit(0);
}

runGrandPrizeDemo().catch(console.error);
