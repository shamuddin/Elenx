/**
 * SOVEREIGN MEMORY ENGINE
 * Powered by Cognee (topoteretes/cognee)
 *
 * This engine provides ELENX with long-term memory of semantic threats.
 * It uses the 'remember' and 'recall' patterns to identify known hijacks.
 */
export declare class SovereignMemoryEngine {
    private apiKey;
    private serviceUrl;
    constructor();
    /**
     * Records a new semantic threat pattern in the Knowledge Graph.
     * Maps the malicious selector to the domain and the intent context.
     */
    rememberThreat(domain: string, selector: string, intent: string, reason: string): Promise<void>;
    /**
     * Recalls historical threats similar to the current action.
     * Uses vector + graph search to determine if this pattern has been seen before.
     */
    recallThreats(domain: string, action: string): Promise<string[]>;
}
//# sourceMappingURL=memory.d.ts.map