import { AgentMCP } from '../packages/mcp-server/src/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * MCP ISOLATION PROFILER
 * This script bypasses Claude Code and invokes the MCP server logic directly.
 * It measures exact latency for each phase of the 'browse' tool to identify bottlenecks.
 */
async function runProfiler() {
    console.log('--- STARTING MCP ISOLATION PROFILER ---');
    
    // We instantiate the core class directly, bypassing the stdio transport
    // This removes Claude Code latency from the equation.
    const mcp = new AgentMCP();
    
    const testUrl = "https://en.wikipedia.org/wiki/Artificial_intelligence";
    const intent = "Read the Wikipedia article on Artificial Intelligence to summarize the first paragraph";

    console.log(`\n[Test Case]: Wikipedia Web Unblocker Fast-Path`);
    console.log(`[URL]: ${testUrl}`);
    console.log(`[Intent]: ${intent}`);

    const startTime = Date.now();

    try {
        // Manually trigger the 'browse' logic as if we were the JSON-RPC handler
        console.log('\n[0ms] Initiating Browse Tool...');
        
        // Ensure kernel boots
        if (!(mcp as any).kernel) {
            const { ElenxKernel } = await import('../src/index.js');
            (mcp as any).kernel = new ElenxKernel(mcp);
            await (mcp as any).kernel.boot();
            console.log(`[${Date.now() - startTime}ms] Kernel Booted & Attested.`);
        }

        mcp.setRootIntent(intent);
        
        const workflowStart = Date.now();
        console.log(`[${workflowStart - startTime}ms] Starting Autonomous Workflow...`);
        
        const result = await (mcp as any).kernel.runAutonomousWorkflow(intent, testUrl, "body");
        
        const workflowLatency = Date.now() - workflowStart;
        console.log(`\n[${Date.now() - startTime}ms] Workflow Complete.`);
        console.log(`Workflow Total Latency: ${workflowLatency}ms`);

        if (result.success) {
            console.log('✅ Status: SUCCESS');
            const preview = (result.content || result.data || "").substring(0, 150);
            console.log(`Preview: ${preview.replace(/\n/g, ' ')}...`);
        } else {
            console.log('❌ Status: FAILED/BLOCKED');
            console.log(`Reason: ${result.content || result.error}`);
        }

    } catch (e: any) {
        console.error(`\n❌ CRITICAL CRASH: ${e.message}`);
    }
    
    process.exit(0);
}

runProfiler().catch(console.error);
