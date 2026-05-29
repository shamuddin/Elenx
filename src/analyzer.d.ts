export interface SemanticScore {
    score: number;
    reason: string;
    isAdversarial: boolean;
}
export declare class SemanticAnalyzer {
    private genAI;
    private model;
    private apiKey;
    private aimlKey;
    constructor();
    analyzeDirective(text: string): Promise<SemanticScore>;
    /**
     * RULE OF TWO: Consensus Verification
     * Uses Primary (Gemini) + Redundant Skeptic (AI/ML API or Gemini fallback)
     */
    verifyIntentConsistency(intent: string, action: string): Promise<SemanticScore>;
    private primaryVerification;
    private skepticalAudit;
    /**
     * SOVEREIGN RE-ROUTER: Stable Denial Semantics (SDS)
     * Powered by Gemini. Generates a 'Recovery Guide' after a block to
     * satisfy the agent's completion drive safely (Prevents Internal Safety Collapse).
     * Complies with NIST AI 600-1 (2026 Refresh) for audit-defensible autonomous fix.
     */
    generateRecoveryGuide(intent: string, blockedAction: string, reason: string): Promise<any>;
}
//# sourceMappingURL=analyzer.d.ts.map