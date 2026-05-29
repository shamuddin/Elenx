/**
 * Layered Triage Engine for AgentOS
 * Implements Tiered Gating to solve the Latency & COGS problem.
 */
export declare enum TriageTier {
    TIER_1_DETERMINISTIC = "TIER_1_DETERMINISTIC",// <1ms
    TIER_2_HEURISTIC = "TIER_2_HEURISTIC",// <150ms
    TIER_3_SEMANTIC = "TIER_3_SEMANTIC"
}
export interface TriageResult {
    tier: TriageTier;
    isApproved: boolean;
    reason: string;
    latencyMs: number;
}
export declare class TriageEngine {
    private whitelist;
    private blacklist;
    constructor();
    /**
     * Tier 1 Check: Deterministic
     */
    private checkTier1;
    /**
     * Tier 2 Check: Heuristic (Local SLM Simulation)
     */
    private checkTier2;
    triage(intent: string, selector: string): Promise<TriageResult>;
}
//# sourceMappingURL=triage.d.ts.map