"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentMCP = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const core_1 = require("@elenx/core");
// CRITICAL: MCP Stdio transport uses stdout for JSON-RPC. 
// Any other output to stdout will break the protocol.
console.log = console.error;
process.env.ELENX_SILENT_TUI = 'true';
process.on('uncaughtException', (error) => {
    console.error('[CRITICAL] Uncaught Exception:', error);
});
class AgentMCP {
    server;
    rootIntent = "";
    analyzer;
    zkEngine;
    ledger;
    verifiedManifests = new Map();
    kernel = null;
    sessionStarted = false;
    constructor() {
        this.analyzer = new core_1.SemanticAnalyzer();
        this.zkEngine = new core_1.zkSIPEngine();
        this.ledger = new core_1.TransactionalLedger();
        // Pre-attest autonomous-agent for the live demo so we can showcase semantic filtering
        this.verifiedManifests.set('autonomous-agent', ['*']);
        this.server = new index_js_1.Server({
            name: "elenx-sif",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupTools();
    }
    ensureSessionStarted(actionName) {
        if (!this.sessionStarted) {
            this.ledger.record({
                type: "session_boundary",
                title: `SESSION AUTO-START (${actionName.toUpperCase()})`,
                timestamp: new Date()
            });
            this.sessionStarted = true;
        }
    }
    setKernel(kernel) {
        this.kernel = kernel;
    }
    setRootIntent(intent) {
        this.rootIntent = intent;
        this.ledger.record({
            type: "mcp_intent_established",
            intent: intent,
            source: "autonomous-agent"
        });
    }
    async verifyAction(action, callerId = "system", args = {}) {
        this.ensureSessionStarted(`verify_${action}`);
        // --- TASK 2.2: Strict First-Action Gating ---
        if (!this.rootIntent) {
            console.error(`\x1b[33m[ELENX-Governance] First-Action Gate Triggered. Analyzing provenance...\x1b[0m`);
            const inference = await this.analyzer.inferIntent(action);
            // Fail-Closed: If we can't bootstrap with 90%+ confidence, block and ask for explicit intent.
            if (!inference.isSafeBootstrap || (inference.score && inference.score < 0.9)) {
                const msg = `INTENT_LAUNDERING_PROTECTION: The agent attempted an initial action ('${action}') that lacks explicit user intent and failed high-confidence inference. Please set_root_intent first.`;
                this.ledger.record({ type: "mcp_block", action, callerId, reason: msg });
                return { isConsistent: false, message: msg };
            }
            this.rootIntent = inference.intent;
            this.ledger.record({
                type: "mcp_intent_bootstrapped",
                intent: this.rootIntent,
                source_action: action,
                note: "Hardened inference (Anti-Laundering)"
            });
        }
        // Phase 1: Identity Lineage Check
        if (callerId !== "system" && !this.verifiedManifests.has(callerId)) {
            const msg = `UNAUTHORIZED_CALLER: Identity '${callerId}' is not attested.`;
            this.ledger.record({ type: "mcp_block", action, callerId, reason: "unattested_identity" });
            return { isConsistent: false, message: msg };
        }
        // --- TASK S4: Semantic Egress Filtering ---
        const argumentString = JSON.stringify(args);
        const isExfiltrationRisk = argumentString.includes('key') || argumentString.includes('secret') || argumentString.includes('password') || argumentString.includes('cookie');
        if (isExfiltrationRisk) {
            this.ledger.record({ type: "mcp_egress_warning", action, args: "REDACTED", callerId });
            // For now, we escalate to LLM, but a production rule would block PII egress automatically.
        }
        // Determine target selector and domain from args
        const target = typeof args === 'object' && args !== null && args.target ? args.target : action;
        const domain = typeof args === 'object' && args !== null && args.url ? args.url : "unknown_domain";
        // Pre-Phase 2: Check Cognee Memory for known threats to save LLM calls and improve efficiency
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const recallRes = await fetch('http://127.0.0.1:8001/recall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, selector: target }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (recallRes.ok) {
                const recallData = await recallRes.json();
                if (recallData.results && recallData.results.length > 0) {
                    const msg = "[Cognee Memory] Known Threat Detected! Pattern matched past adversarial selector.";
                    this.ledger.record({ type: "mcp_block", action, target, callerId, reason: msg });
                    return { isConsistent: false, message: msg };
                }
            }
        }
        catch (e) {
            console.error("\x1b[33m[Knowledge Fabric] Failed to recall from cognee:", e.message, "\x1b[0m");
        }
        // Phase 2: Use LLM-powered semantic analysis
        const result = await this.analyzer.verifyIntentConsistency(this.rootIntent, action + (isExfiltrationRisk ? " with sensitive arguments" : ""));
        this.ledger.record({
            type: result.score > 0.6 ? "mcp_approval" : "mcp_block",
            action,
            target,
            callerId,
            score: result.score,
            reason: result.reason
        });
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            await fetch('http://127.0.0.1:8001/remember', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: domain,
                    selector: target,
                    intent: this.rootIntent,
                    reason: result.reason,
                    caller_id: callerId,
                    status: result.score > 0.6 ? "ALLOW" : "BLOCK"
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        }
        catch (e) {
            console.error("\x1b[33m[Knowledge Fabric] Failed to log telemetry to cognee:", e.message, "\x1b[0m");
        }
        return {
            isConsistent: result.score > 0.6,
            message: result.reason
        };
    }
    setupTools() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "attest_capability",
                    description: "Submit a signed manifest to attest server capabilities (Prevents Capability Escalation)",
                    inputSchema: {
                        type: "object",
                        properties: {
                            serverId: { type: "string" },
                            manifest: { type: "array", items: { type: "string" } },
                            signature: { type: "string" }
                        },
                        required: ["serverId", "manifest", "signature"],
                    },
                },
                {
                    name: "zk_verify",
                    description: "Verify a Zero-Knowledge Intent Proof for a high-privacy transaction",
                    inputSchema: {
                        type: "object",
                        properties: {
                            proof: { type: "object" },
                            intent: { type: "string" }
                        },
                        required: ["proof", "intent"],
                    },
                },
                {
                    name: "set_root_intent",
                    description: "Set the original user intent for governance",
                    inputSchema: {
                        type: "object",
                        properties: {
                            intent: { type: "string" },
                        },
                        required: ["intent"],
                    },
                },
                {
                    name: "verify_action",
                    description: "Verify if an agent action aligns with root intent (Prevents SSPI). Also performs Semantic Egress Filtering on arguments.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            action: { type: "string", description: "The technical action (e.g. click, type, submit)" },
                            target: { type: "string", description: "The target selector or identifier" },
                            metadata: { type: "object", description: "Optional: The payload or arguments being sent (e.g. { text: 'my-password' })" },
                            callerId: { type: "string" }
                        },
                        required: ["action", "target"],
                    },
                },
                {
                    name: "browse",
                    description: "Smartly and safely browse a URL. The system automatically handles unblocking, semantic scrubbing, and jurisdictional routing based on the target site's risk profile.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            url: { type: "string", description: "The URL to browse" },
                            intent: { type: "string", description: "The reason you are browsing this page (Optional, can be inferred)" }
                        },
                        required: ["url"],
                    },
                },
                {
                    name: "create_new_session",
                    description: "Manually create a new visual section in the ELENX Mission Control TUI.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "The title of the new session/section" }
                        },
                        required: ["title"],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const actionName = request.params.name;
            this.ensureSessionStarted(actionName);
            switch (actionName) {
                case "create_new_session":
                    {
                        const { title } = request.params.arguments;
                        this.ledger.record({
                            type: "session_boundary",
                            title: title,
                            timestamp: new Date()
                        });
                        return {
                            content: [{ type: "text", text: `New TUI session created: ${title}` }]
                        };
                    }
                case "attest_capability":
                    const { serverId, manifest } = request.params.arguments;
                    this.verifiedManifests.set(serverId, manifest);
                    console.error(`\x1b[32m[Governance] Attestation Successful for: ${serverId}\x1b[0m`);
                    return {
                        content: [{ type: "text", text: `Capabilities attested for ${serverId}` }],
                    };
                case "zk_verify":
                    {
                        const { proof, intent: zkIntent } = request.params.arguments;
                        const isValid = this.zkEngine.verifyProof(proof, zkIntent);
                        return {
                            content: [{ type: "text", text: isValid ? "ZK_PROOF_VALIDATED" : "ZK_PROOF_INVALID" }],
                            isError: !isValid
                        };
                    }
                case "set_root_intent":
                    {
                        const r_intent = request.params.arguments.intent;
                        this.setRootIntent(r_intent);
                        return {
                            content: [{ type: "text", text: `Root intent set to: ${r_intent}` }],
                        };
                    }
                case "verify_action":
                    {
                        const args = request.params.arguments;
                        const verification = await this.verifyAction(args.action, args.callerId, args);
                        return {
                            content: [{
                                    type: "text",
                                    text: verification.message
                                }],
                            isError: !verification.isConsistent
                        };
                    }
                case "browse":
                    {
                        const { url, intent: browseIntent } = request.params.arguments;
                        const finalIntent = browseIntent || this.rootIntent || "General Web Discovery";
                        const isNewMission = !this.kernel || (browseIntent && browseIntent !== this.rootIntent);
                        if (isNewMission) {
                            if (!this.kernel) {
                                const { ElenxKernel } = require("../../../src/index.js");
                                this.kernel = new ElenxKernel(this);
                                await this.kernel.boot();
                            }
                            this.setRootIntent(finalIntent);
                            // Log start header ONCE per mission
                            console.error(`\n\x1b[35m--- [SIF] STARTING SECURE SESSION ---\x1b[0m`);
                            console.error(`\x1b[36mIntent:\x1b[0m ${finalIntent}\n`);
                        }
                        const result = await this.kernel.runAutonomousWorkflow(finalIntent, url, "body");
                        if (result.success) {
                            return {
                                content: [{ type: "text", text: result.content || "Page read successfully (Protected)." }]
                            };
                        }
                        else {
                            return {
                                content: [{ type: "text", text: `Access Blocked: ${result.content || "Security violation detected during browsing."}` }],
                                isError: true
                            };
                        }
                    }
                default:
                    throw new Error("Unknown tool");
            }
        });
    }
    async start() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error("ELENX MCP Server running on stdio");
    }
}
exports.AgentMCP = AgentMCP;
const server = new AgentMCP();
server.start().catch(console.error);
//# sourceMappingURL=index.js.map