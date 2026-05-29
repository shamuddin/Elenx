import { MissionControlUI, TransactionalLedger } from '@elenx/core';
import * as fs from 'fs';
import * as path from 'path';
/**
 * ELENX Live Monitor
 * This script provides a high-fidelity terminal view of LIVE Claude Code actions.
 * It watches the shared ledger and updates the TUI in real-time.
 */
const tui = new MissionControlUI();
const ledger = new TransactionalLedger();
const ledgerPath = path.join(process.cwd(), 'logs', 'ledger.json');
let lastIndex = -1;
function updateUIFromLedger() {
    try {
        if (!fs.existsSync(ledgerPath))
            return;
        const content = fs.readFileSync(ledgerPath, 'utf8');
        const chain = JSON.parse(content);
        // Only process NEW entries
        const newEntries = chain.filter(entry => entry.index > lastIndex);
        for (const entry of newEntries) {
            const data = entry.data;
            // Map ledger events to TUI logs and Telemetry updates
            if (data.type === 'mcp_intent_established' || data.type === 'mcp_intent_bootstrapped') {
                tui.addLog(`[GOVERNANCE] NEW INTENT: ${data.intent}`, 'warning');
                tui.updateTelemetry('Sovereignty', '🟢 SECURE');
            }
            else if (data.type === 'mcp_approval') {
                tui.addLog(`[MATCH] Action Approved: ${data.action}`, 'success');
                tui.updateTelemetry('Ledger', entry.hash.substring(0, 8));
            }
            else if (data.type === 'mcp_block') {
                const reason = data.reason || "Unspecified security drift";
                let blockType = "SECURITY VIOLATION";
                if (reason.includes('INTENT_LAUNDERING'))
                    blockType = "PROVENANCE FAILURE";
                else if (reason.includes('UNAUTHORIZED_CALLER'))
                    blockType = "IDENTITY FAILURE";
                else if (reason.includes('Infrastructure Bifurcation'))
                    blockType = "BIFURCATION DETECTED";
                tui.addLog(`[BLOCK] ${blockType}: ${reason}`, 'danger');
                tui.addLog(`[POLICY] Denied Action: ${data.action}`, 'info');
                const currentThreats = parseInt(tui.getTelemetry('Threats')) || 0;
                tui.updateTelemetry('Threats', (currentThreats + 1).toString());
            }
            else if (data.type === 'identity_attested') {
                tui.addLog(`[IDENTITY] Agent Attested: ${data.id} (${data.name})`, 'success');
                tui.updateTelemetry('NHI-ID', data.id);
            }
            else if (data.type === 'bifurcation_check') {
                const symbol = data.status === 'MATCHED' ? '✅' : '❌';
                tui.addLog(`[BIFURCATION] ${data.status} for ${data.url}`, data.status === 'MATCHED' ? 'success' : 'danger');
                tui.updateTelemetry('Bifurcation', `${symbol} ${data.status}`);
            }
            else if (data.type === 'workflow_complete') {
                const completedWorkflows = chain.filter(e => e.data.type === 'workflow_complete');
                // Calculate average token lift
                const successWorkflows = completedWorkflows.filter(e => e.data.status === 'SUCCESS');
                const avgTokenLift = successWorkflows.length > 0
                    ? Math.round(successWorkflows.reduce((sum, e) => sum + (e.data.roi?.tokensSaved || 0), 0) / successWorkflows.length)
                    : 0;
                tui.updateTelemetry('Latency Lift', `+${avgTokenLift}%`);
                tui.updateTelemetry('Latency', `${data.latencyMs || 0}ms`);
                tui.addLog(`[COMPLETED] Workflow ${data.workflowId}: ${data.status} (${data.latencyMs || 0}ms)`, data.status === 'SUCCESS' ? 'success' : 'danger');
            }
            else if (data.type === 'session_boundary') {
                tui.newSection(data.title || "User Requested");
            }
            else if (data.type === 'workflow_start') {
                tui.addLog(`▶ [WORKFLOW] Executing task: ${data.intent}`, 'info');
                tui.updateTelemetry('Mode', '🌐 BROWSER');
            }
            lastIndex = entry.index;
        }
    }
    catch (e) {
        // Silent fail for concurrent read/write
    }
}
async function startMonitor() {
    // Phase 0: Initial State Capture (Get latest context without aggregating lifetime metrics)
    if (fs.existsSync(ledgerPath)) {
        try {
            const chain = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
            // Start fresh for the session
            tui.updateTelemetry('Latency Lift', '+0%');
            tui.updateTelemetry('Threats', '0');
            // Get last NHI and Bifurcation status for immediate context
            const lastIdentity = [...chain].reverse().find(e => e.data.type === 'identity_attested');
            if (lastIdentity)
                tui.updateTelemetry('NHI-ID', lastIdentity.data.id);
            const lastBifurcation = [...chain].reverse().find(e => e.data.type === 'bifurcation_check');
            if (lastBifurcation) {
                const symbol = lastBifurcation.data.status === 'MATCHED' ? '✅' : '❌';
                tui.updateTelemetry('Bifurcation', `${symbol} ${lastBifurcation.data.status}`);
            }
            // Sync pointer to the end so we only process NEW events
            lastIndex = chain.length > 0 ? chain[chain.length - 1].index : -1;
        }
        catch (e) {
            lastIndex = -1;
        }
    }
    tui.newSection('MONITOR CONNECTED');
    tui.addLog('ELENX LIVE MONITOR MODE ACTIVATED', 'success');
    tui.addLog('Syncing to Ledger Tip... Listening for real-time events.', 'info');
    tui.updateTelemetry('Mode', 'MONITOR');
    tui.updateTelemetry('Proxy', 'Bright Data US');
    // Watch for changes every 500ms
    setInterval(updateUIFromLedger, 500);
}
console.clear();
startMonitor().catch(console.error);
//# sourceMappingURL=monitor.js.map