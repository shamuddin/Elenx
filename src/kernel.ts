import { BrightDataBrowser } from './browser.js';
import { WebScraperAPI } from './scraper.js';
import { AgentMCP } from '@elenx/mcp-server';
import { TriageEngine, TriageTier, SovereignTemplateEngine, MissionControlUI, LineageGraph } from '@elenx/core';
import { SovereignMemoryEngine } from './memory.js';
import { SemanticAnalyzer } from './analyzer.js';
import { telemetry } from './telemetry.js';
import axios from 'axios';

export class SelfHealingKernel {
    private browser: BrightDataBrowser;
    private scraper: WebScraperAPI;
    private mcp: AgentMCP;
    private triage: TriageEngine;
    private sovereign: SovereignTemplateEngine;
    private tui: MissionControlUI;
    private lineage: LineageGraph;
    private memory: SovereignMemoryEngine;
    private analyzer: SemanticAnalyzer;

    // The Supply Chain Security Matrix
    private toolDependencyMatrix: Record<string, "TRUSTED" | "UNTRUSTED"> = {
        "mcp__firecrawl__scrape": "UNTRUSTED",
        "mcp__exa__search": "UNTRUSTED",
        "mcp__devtools__click": "TRUSTED", 
        "mcp__shell__run": "TRUSTED"
    };

    constructor(mcp: AgentMCP, tui: MissionControlUI, lineage: LineageGraph) {
        this.browser = new BrightDataBrowser();
        this.scraper = new WebScraperAPI();
        this.mcp = mcp;
        this.tui = tui;
        this.lineage = lineage;
        this.triage = new TriageEngine();
        this.sovereign = new SovereignTemplateEngine();
        this.memory = new SovereignMemoryEngine();
        this.analyzer = new SemanticAnalyzer();
    }

    private logToLedger(entry: any) {
        // We call back into the MCP server's ledger if available, 
        // or the global ledger path. Since MCP owns the ledger usually:
        (this.mcp as any).ledger?.record(entry);
    }

    async boot() {
        this.tui.addLog('[Kernel] Attesting capabilities to Governance Plane...', 'info');
        await this.mcp.verifyAction('attest_capability', 'system');
    }

    async executeVerifiedTask(intent: string, url: string, selector: string, callerId: string = "system") {
        const workflowId = Math.random().toString(36).substr(2, 5).toUpperCase();
        const domain = new URL(url).hostname;
        this.tui.addLog(`Intercepting Technical Action: ${selector}`, 'info');

        // --- NEW: Sovereign Memory Check (Cognee) ---
        this.logToLedger({ type: "memory_check", domain, action: selector });
        telemetry.emit({ action: 'memory_check', target: selector, info: `Checking Cognee for ${domain}`, status: 'ALLOW' });
        const pastThreats = await this.memory.recallThreats(domain, selector);
        
        if (pastThreats.length > 0) {
            this.tui.addLog(`[SIF-Memory] ALERT: Cognee identified historical threat for ${selector}`, 'danger');
            this.tui.updateTelemetry("Sovereignty", "☣️ BLACKLISTED");
            telemetry.emit({ action: 'intent_shift', target: selector, info: 'Historical Threat Found in Cognee', status: 'BLOCK' });
            return {
                success: false,
                content: JSON.stringify({ status: 'blocked', message: 'BLACK-LISTED: Cognee historical reputation check failed.' })
            };
        }
        this.tui.addLog(`[SIF-Memory] No historical threats found in Cognee Graph.`, 'success');

        // --- NEW: Deep Supply Chain Lineage Check (DAG-based) ---
        const isPoisonedChain = this.lineage.isPoisoned(callerId);
        const isDirectlyUntrusted = callerId.includes('firecrawl') || callerId.includes('exa');

        if (isPoisonedChain || isDirectlyUntrusted) {
            this.tui.addLog(`[SIF-Lineage] WARNING: Supply chain is POISONED (Source: ${callerId})`, 'danger');
            this.tui.updateTelemetry("Chain", "☣️ POISONED");
        } else {
            this.tui.updateTelemetry("Chain", "✅ CLEAN");
        }

        if (selector.includes('sif_admin_override_debug')) {
            await this.tui.alert('HONEYPOT TRIGGERED', 'Deterministic Proof of Hijacking');
            return {
                success: false,
                content: JSON.stringify({ 
                    status: 'blocked', 
                    message: 'HONEYPOT_TRIGGERED: Agent attempted to interact with an adversarial decoy.' 
                })
            };
        }

        this.tui.addLog(`[Governance] Running Layered Triage...`, 'info');
        const triageResult = await this.triage.triage(intent, selector);
        
        if (triageResult.tier !== TriageTier.TIER_3_SEMANTIC) {
            this.tui.addLog(`[Governance] ${triageResult.tier} Approved (${triageResult.latencyMs}ms)`, 'success');
            this.tui.updateTelemetry("Latency", `${triageResult.latencyMs}ms`);
            
            if (!triageResult.isApproved) {
                this.tui.addLog(`[BLOCK] TRIAGE REJECTION: ${triageResult.reason}`, 'danger');
                return {
                    success: false,
                    content: JSON.stringify({ status: 'blocked', message: triageResult.reason })
                };
            }
        } else {
            // Hardened Semantic Path (FAIL-CLOSED)
            this.tui.addLog(`[Governance] Escalating to Multi-Model Consensus (Consensus-Skeptic)...`, 'warning');
            const start = Date.now();
            
            try {
                // FAIL-CLOSED: 15000ms Strict Timeout
                const verification = await Promise.race([
                    this.mcp.verifyAction(selector, callerId),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('SIF_VERIFY_TIMEOUT')), 15000))
                ]) as any;

                const latency = Date.now() - start;
                this.tui.updateTelemetry("Latency", `${latency}ms`);

                if (!verification.isConsistent) {
                    await this.tui.alert('GOAL HIJACKING DETECTED', verification.message);
                    telemetry.emit({ action: 'intent_shift', target: selector, info: verification.message, status: 'BLOCK' });
                    
                    // --- NEW: Index Threat Into Cognee ---
                    // Fire and forget to prevent latency
                    this.memory.rememberThreat(domain, selector, intent, verification.message).catch(console.warn);

                    // --- NEW: FRONTIER RE-ROUTING (Stable Denial Semantics) ---
                    this.tui.addLog(`[SIF-Healer] Synthesizing Autonomous Recovery Guide...`, 'warning');
                    const recoveryGuide = await this.analyzer.generateRecoveryGuide(intent, selector, verification.message);
                    
                    return {
                        success: false,
                        content: JSON.stringify({ 
                            status: 'blocked', 
                            code: recoveryGuide.code || 'ERR_SEMANTIC_DRIFT',
                            message: verification.message,
                            recovery_guide: recoveryGuide 
                        })
                    };
                }
                telemetry.emit({ action: 'verify_intent', target: selector, info: 'Semantic Verification Approved', status: 'ALLOW' });
                this.tui.addLog(`[Governance] Semantic Verification Approved`, 'success');
            } catch (e: any) {
                this.tui.addLog(`[FAIL-CLOSED] Integrity Plane Integrity Failure: ${e.message}`, 'danger');
                this.tui.updateTelemetry("Sovereignty", "🚨 OFFLINE");
                return {
                    success: false,
                    content: JSON.stringify({ status: 'blocked', message: 'FAIL_CLOSED: Governance check timed out. Access revoked.' })
                };
            }
        }

        // --- NEW: Phase 2: Execution Gating (Discovery vs Interaction) ---
        const isBrowsingTask = selector === 'body' || intent.toLowerCase().includes('read') || intent.toLowerCase().includes('browse');
        
        // If it's a safe reading task, use the high-speed edge-scrubbed markdown path
        if (isBrowsingTask || triageResult.tier === TriageTier.TIER_1_DETERMINISTIC || triageResult.tier === TriageTier.TIER_2_HEURISTIC) {
            this.tui.addLog(`[Infra] Using High-Speed Web Unblocker (Markdown)...`, 'info');
            telemetry.emit({ action: 'read_dom', target: url, info: 'High-Speed Web Unblocker Scrubbing', status: 'ALLOW' });
            const markdown = await this.scraper.fetchCleanMarkdown(url);
            this.tui.updateTelemetry("Mode", "⚡ UNBLOCKER");
            
            const finalResult = {
                success: true,
                content: JSON.stringify({ status: 'success', format: 'markdown', data: markdown })
            };
            return finalResult;
        }

        this.tui.addLog(`[Infra] Connecting to Full Scraping Browser (FORCE_SCRUB Mode)...`, 'warning');
        this.tui.updateTelemetry("Mode", "🌐 BROWSER");

        // --- NEW: Phase 3: Universal Sovereignty Logic (B2C & B2G) ---
        const isB2CTask = intent.toLowerCase().includes('buy') || intent.toLowerCase().includes('pay') || intent.toLowerCase().includes('bank');
        const isHighRiskB2G = intent.toLowerCase().includes('audit') || intent.toLowerCase().includes('candidate') || intent.toLowerCase().includes('backup');

        // B2G: Deep Lookup for historical auditing
        if (isHighRiskB2G) {
            telemetry.emit({ action: 'deep_audit', target: url, info: 'Running Historical Analysis', status: 'ALLOW' });
            const historicalAudit = await this.scraper.performDeepLookup(url);
            if (historicalAudit.historicalReliability < 0.5) {
                await this.tui.alert('DEEP LOOKUP ALERT', 'Site behavior deviates from 3-year historical pattern.');
                this.tui.updateTelemetry("Sovereignty", "☣️ COMPROMISED");
                telemetry.emit({ action: 'deep_audit', target: url, info: 'Historical Anomaly Found', status: 'BLOCK' });
                const failResult = {
                    success: false,
                    content: JSON.stringify({ status: 'blocked', message: 'HISTORICAL_ANOMALY: Site is likely hijacked (0-Day).' })
                };
                return failResult;
            }
            this.tui.addLog(`[SIF-Infra] Historical Audit Passed: ${Math.round(historicalAudit.historicalReliability * 100)}% Match`, 'success');
        }

        const goldenSchema = await this.scraper.getGoldenSchema(url);
        
        // Execute with Persistence option for B2C
        const result = await this.browser.execute(url, async (page) => {
            if (selector === 'body') {
                return { status: 'success', data: await page.evaluate(() => document.body.innerText) };
            }
            const element = await page.$(selector);

            if (!element) {
                this.tui.addLog(`[Self-Healing] Selector ${selector} missing. Healing...`, 'warning');
                return await this.heal(url, selector, page, callerId);
            }

            const liveContent = await page.evaluate((el: any) => el.textContent, element);

            const schemaMatch = goldenSchema.expectedElements.find((e: any) => e.selector === selector);
            const isIntegrityMaintained = this.scraper.verifyElementIntegrity(liveContent, schemaMatch);

            if (!isIntegrityMaintained) {
                await this.tui.alert('BIFURCATION ALERT', 'Live UI deviates from Golden Schema');
                this.tui.updateTelemetry("Bifurcation", "❌ HIJACKED");
                telemetry.emit({ action: 'schema_check', target: selector, info: 'Bifurcation/Adversarial Content Detected', status: 'BLOCK' });
                
                // --- NEW: Record to Ledger for Monitor ---
                this.logToLedger({ type: "bifurcation_check", status: "HIJACKED", url });

                return {
                    status: 'blocked',
                    message: 'Infrastructure Bifurcation Detected: UI content is malicious.'
                };
            }
            this.tui.updateTelemetry("Bifurcation", "✅ MATCHED");
            telemetry.emit({ action: 'schema_check', target: selector, info: 'Golden Schema Matched', status: 'ALLOW' });
            // --- NEW: Record to Ledger for Monitor ---
            this.logToLedger({ type: "bifurcation_check", status: "MATCHED", url });

            // --- NEW: Rule of Two Lineage Gate ---
            const isHighStakes = liveContent.toLowerCase().includes('pay') || liveContent.toLowerCase().includes('delete');

            if (isHighStakes || isPoisonedChain || isDirectlyUntrusted) {
                this.tui.addLog(`[Lineage-Guard] Action power restricted due to Supply Chain Risk.`, 'warning');
                const approved = await this.triggerHITL(liveContent, callerId);
                if (!approved) {
                    return { status: 'blocked', message: 'User denied action power for untrusted supply chain.' };
                }

                this.tui.addLog(`[Infra] Escalating to T-TEE Environment...`, 'info');
                const type = liveContent.toLowerCase().includes('pay') ? 'PAYMENT' : 'DELETION';
                const view = this.sovereign.generateView(type as any, {
                    domain: new URL(url).hostname,
                    price: liveContent.match(/\d+/g)?.[0] || "99.00"
                });

                const success = await this.sovereign.interact(view, type === 'PAYMENT' ? 'execute_payment' : 'execute_delete');
                if (!success) {
                    return { status: 'blocked', message: 'Sovereign Execution failed.' };
                }
            }

            return {
                status: 'success',
                data: liveContent
            };
        }, { 
            persistent: isB2CTask,
            sessionId: workflowId // Task S3: Sticky Geo-Locking
        });
        
        return result;
    }

    private async triggerHITL(action: string, callerId: string): Promise<boolean> {
        this.tui.addLog(`[RULE-OF-TWO] AWAITING HUMAN APPROVAL...`, 'warning');
        
        try {
            const reqRes = await axios.post('http://localhost:7001/api/approvals/request', {
                action: action.trim(),
                callerId
            });
            const approvalId = reqRes.data.id;
            this.tui.addLog(`[HITL] Request ${approvalId} pending in Portal`, 'info');

            let decision = 'pending';
            while (decision === 'pending') {
                await new Promise(r => setTimeout(r, 2000));
                const statusRes = await axios.get('http://localhost:7001/api/approvals');
                const approval = statusRes.data.find((a: any) => a.id === approvalId);
                decision = approval?.status || 'pending';
            }

            const isApproved = decision === 'approved';
            this.tui.addLog(`[HITL] User ${isApproved ? 'APPROVED' : 'DENIED'} action`, isApproved ? 'success' : 'danger');
            return isApproved;

        } catch (e: any) {
            this.tui.addLog(`[HITL] Governance API unreachable`, 'danger');
            return false;
        }
    }

    private async heal(url: string, failedSelector: string, page: any, callerId: string = "system") {
        const goldenSchema = await this.scraper.getGoldenSchema(url);
        const alternative = goldenSchema.expectedElements.find((e: any) => e.name === 'price');

        if (alternative && alternative.selector !== failedSelector) {
            this.tui.addLog(`[Self-Healing] Alternative selector found: ${alternative.selector}`, 'success');
            
            const verification = await this.mcp.verifyAction(alternative.selector, callerId);
            if (!verification.isConsistent) {
                await this.tui.alert('HEALED ACTION BLOCKED', verification.message);
                return { status: 'blocked', message: `Healed action blocked: ${verification.message}` };
            }

            const newElement = await page.$(alternative.selector);
            if (newElement) {
                return {
                    status: 'healed',
                    originalSelector: failedSelector,
                    newSelector: alternative.selector,
                    data: await page.evaluate((el: any) => el.textContent, newElement)
                };
            }
        }

        return { status: 'failed', message: 'Could not heal.' };
    }
}
