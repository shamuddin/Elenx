export interface SemanticScore {
    score: number;
    reason: string;
    isAdversarial: boolean;
}
export declare class SemanticAnalyzer {
    private genAI;
    private model;
    private apiKey;
    constructor();
    analyzeDirective(text: string): Promise<SemanticScore>;
    verifyIntentConsistency(intent: string, action: string): Promise<SemanticScore>;
    inferIntent(action: string): Promise<{
        intent: string;
        isSafeBootstrap: boolean;
    }>;
}
//# sourceMappingURL=analyzer.d.ts.map