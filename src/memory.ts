import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * SOVEREIGN MEMORY ENGINE
 * Powered by Cognee (topoteretes/cognee)
 * 
 * This engine provides ELENX with long-term memory of semantic threats.
 * It uses the 'remember' and 'recall' patterns to identify known hijacks.
 */
export class SovereignMemoryEngine {
    private apiKey: string | undefined;
    private serviceUrl: string;

    constructor() {
        this.apiKey = process.env.COGNEE_API_KEY;
        this.serviceUrl = process.env.COGNEE_SERVICE_URL || 'https://api.cognee.ai';
    }

    /**
     * Records a new semantic threat pattern in the Knowledge Graph.
     * Maps the malicious selector to the domain and the intent context.
     */
    async rememberThreat(domain: string, selector: string, intent: string, reason: string) {
        if (!this.apiKey) return;

        console.error(`\x1b[35m[SIF-Memory] Cognee: Indexing new semantic threat for ${domain}...\x1b[0m`);
        
        const payload = `Adversarial hijacking pattern found on ${domain}. 
        Action: ${selector}. 
        Detected during intent: ${intent}. 
        Reason: ${reason}`;

        try {
            // Updated to match python memory-service expected payload
            await axios.post(`${this.serviceUrl}/remember`, {
                domain: domain,
                selector: selector,
                intent: intent,
                reason: reason,
                caller_id: "system"
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
            });
        } catch (e: any) {
            console.warn(`[SIF-Memory] Cognee indexing failed: ${e.message}`);
        }
    }

    /**
     * Recalls historical threats similar to the current action.
     * Uses vector + graph search to determine if this pattern has been seen before.
     */
    async recallThreats(domain: string, action: string): Promise<string[]> {
        if (!this.apiKey) return [];

        console.error(`\x1b[36m[SIF-Memory] Cognee: Recalling historical patterns for ${domain}...\x1b[0m`);

        try {
            // Updated to match python memory-service expected payload
            const response = await axios.post(`${this.serviceUrl}/recall`, {
                domain: domain,
                selector: action
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
                timeout: 2000 // Fast fail for demo
            });

            return (response.data as any).results || [];
        } catch (e: any) {
            console.warn(`[SIF-Memory] Cognee recall failed/timed out: ${e.message}`);
            return [];
        }
    }
}
