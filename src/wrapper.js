import { spawn } from 'child_process';
import { ElenxKernel } from './index.js';
/**
 * ELENX Universal Wrapper
 * Allows running ANY agentic CLI (Codex, Hermes, Claude, etc.)
 * inside a secure Transactional Integrity envelope.
 */
export async function runSovereignAgent(toolCommand, toolArgs, intent) {
    const elenx = new ElenxKernel();
    await elenx.boot();
    elenx.log(`🚀 UNIVERSAL WRAPPER ACTIVE`, 'success');
    elenx.log(`📦 Wrapping Tool: ${toolCommand}`, 'info');
    elenx.log(`🎯 Root Intent: ${intent}`, 'warning');
    // 1. Set the Intent in the Governance Plane
    const mcp = elenx.mcp;
    mcp.setRootIntent(intent);
    elenx.log(`🛡️  Enforcing Semantic Integrity Protocol (SIP)...`, 'info');
    // 2. Launch the target agent as a secure sub-process
    const agentProcess = spawn(toolCommand, toolArgs, {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            ELENX_SOVEREIGN_MODE: 'true',
            ELENX_INTENT: intent,
            HTTPS_PROXY: 'http://localhost:7001/api/v1/proxy'
        }
    });
    agentProcess.on('close', (code) => {
        elenx.log(`🏁 Wrapped agent session finished with code ${code}`, code === 0 ? 'success' : 'danger');
        elenx.finalizeSession();
    });
}
// CLI Entrypoint for the wrapper
if (process.argv.length > 3) {
    const intent = process.argv[2];
    const command = process.argv[3];
    const args = process.argv.slice(4);
    runSovereignAgent(command, args, intent).catch(console.error);
}
//# sourceMappingURL=wrapper.js.map