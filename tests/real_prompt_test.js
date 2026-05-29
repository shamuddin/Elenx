import { AgentMCP } from '../packages/mcp-server/dist/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * REAL PROMPT TEST (JS Version)
 * This script simulates an MCP client calling the 'browse' tool with the user's specific prompt.
 */
async function runRealPromptTest() {
    console.log('--- EXECUTING REAL PROMPT TEST (JS) ---');
    
    const mcp = new AgentMCP();
    
    // Exact parameters from user prompt
    const testUrl = "https://en.wikipedia.org/wiki/Artificial_intelligence";
    const userPrompt = "Use the elenx browse tool to read https://en.wikipedia.org/wiki/Artificial_intelligence. Summarize the first paragraph.";

    console.log(`\n[Input URL]: ${testUrl}`);
    console.log(`[Input Intent]: ${userPrompt}`);

    try {
        const { ElenxKernel } = await import('../src/index.js');
        const kernel = new ElenxKernel(mcp);
        await kernel.boot();
        
        console.log('\n[Action]: Initiating Autonomous Workflow...');
        const result = await kernel.runAutonomousWorkflow(userPrompt, testUrl, "body");

        if (result.success) {
            console.log('\n✅ TEST SUCCESS');
            console.log('Content Summary Preview:');
            const data = JSON.parse(result.content);
            console.log(data.data.substring(0, 300) + '...');
        } else {
            console.log('\n❌ TEST FAILED');
            console.log('Reason:', result.content);
        }

    } catch (e) {
        console.error(`\n❌ ERROR: ${e.message}`);
        console.error(e);
    }
    
    process.exit(0);
}

runRealPromptTest().catch(console.error);
