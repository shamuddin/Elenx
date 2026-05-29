/**
 * Layered Triage Engine for AgentOS
 * Implements Tiered Gating to solve the Latency & COGS problem.
 */
export var TriageTier;
(function (TriageTier) {
    TriageTier["TIER_1_DETERMINISTIC"] = "TIER_1_DETERMINISTIC";
    TriageTier["TIER_2_HEURISTIC"] = "TIER_2_HEURISTIC";
    TriageTier["TIER_3_SEMANTIC"] = "TIER_3_SEMANTIC"; // >500ms
})(TriageTier || (TriageTier = {}));
export class TriageEngine {
    // Tier 1: Deterministic Whitelist (Bloom Filter style)
    whitelist = new Set([
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span', 'div', 'section', 'article',
        'footer', 'header', 'nav', 'main',
        '.price-tag', '.product-title', '.description',
        'button.search', 'input.search-bar'
    ]);
    // Tier 1: Blacklist
    blacklist = new Set([
        'button.delete-all', 'input.admin-password', 'button.exfiltrate_data',
        '#sif_admin_override_debug'
    ]);
    constructor() { }
    /**
     * Tier 1 Check: Deterministic
     */
    checkTier1(selector) {
        const start = Date.now();
        const sel = selector.toLowerCase();
        if (this.blacklist.has(sel)) {
            return {
                tier: TriageTier.TIER_1_DETERMINISTIC,
                isApproved: false,
                reason: "Blacklisted technical action detected.",
                latencyMs: Date.now() - start
            };
        }
        if (this.whitelist.has(sel)) {
            return {
                tier: TriageTier.TIER_1_DETERMINISTIC,
                isApproved: true,
                reason: "Standard UI element whitelisted.",
                latencyMs: Date.now() - start
            };
        }
        return null;
    }
    /**
     * Tier 2 Check: Heuristic (Local SLM Simulation)
     */
    checkTier2(intent, selector) {
        const start = Date.now();
        const sel = selector.toLowerCase();
        const int = intent.toLowerCase();
        // High-stakes keywords that MUST go to Tier 3
        const highStakesKeywords = ['pay', 'transfer', 'delete', 'buy', 'purchase', 'authorize', 'password'];
        const isHighStakes = highStakesKeywords.some(k => int.includes(k) || sel.includes(k));
        if (isHighStakes)
            return null; // Escalate to Tier 3
        // Heuristic: If it's a standard tag and the intent is "view" or "find", approve
        const standardTags = ['a', 'button', 'input', 'img', 'li', 'ul', 'ol'];
        const viewIntents = ['find', 'search', 'view', 'read', 'get', 'list', 'check'];
        const isStandard = standardTags.some(tag => sel.startsWith(tag) || sel === tag);
        const isView = viewIntents.some(v => int.includes(v));
        if (isStandard && isView) {
            return {
                tier: TriageTier.TIER_2_HEURISTIC,
                isApproved: true,
                reason: "Routine exploratory action approved via local heuristic.",
                latencyMs: Date.now() - start + 50 // Simulating SLM latency
            };
        }
        return null;
    }
    async triage(intent, selector) {
        // Run Tier 1
        const t1 = this.checkTier1(selector);
        if (t1)
            return t1;
        // Run Tier 2
        const t2 = this.checkTier2(intent, selector);
        if (t2)
            return t2;
        // Escalate to Tier 3
        return {
            tier: TriageTier.TIER_3_SEMANTIC,
            isApproved: false, // This is just a signal to call the LLM
            reason: "Action requires deep semantic reasoning.",
            latencyMs: 0
        };
    }
}
//# sourceMappingURL=triage.js.map