import { SelfHealingKernel } from '../src/kernel.js';
import { AgentMCP } from '../src/mcp.js';
import { MissionControlUI } from '../src/tui.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testKernel() {
    const mcp = new AgentMCP();
    const tui = new MissionControlUI();
    mcp.setRootIntent('Find');
    const kernel = new SelfHealingKernel(mcp, tui);

    console.log('--- TEST 1: Success Scenario ---');
    // Using a simple site for testing
    const result1 = await kernel.executeVerifiedTask('Find header', 'https://example.com', 'h1');
    console.log('Result 1:', JSON.stringify(result1, null, 2));

    console.log('\n--- TEST 2: Self-Healing Scenario ---');
    // Forcing a failure to trigger healing (selector .non-existent will fail, kernel should heal)
    const result2 = await kernel.executeVerifiedTask('Find price', 'https://rival-shop.com', '.non-existent');
    console.log('Result 2:', JSON.stringify(result2, null, 2));

    console.log('\n--- TEST 3: Blocked Scenario ---');
    // Forcing a block by using a selector that doesn't match intent
    const result3 = await kernel.executeVerifiedTask('Check balance', 'https://example.com', 'button.delete_all');
    console.log('Result 3:', JSON.stringify(result3, null, 2));
}

testKernel().catch(console.error);
