/**
 * zkSIP (Zero-Knowledge Semantic Intent Protocol)
 * Allows an agent to prove intent alignment without revealing private context.
 */
export interface ZKProof {
    proofId: string;
    commitment: string;
    nullifier: string;
    timestamp: Date;
}
export declare class zkSIPEngine {
    constructor();
    /**
     * Generates a "Proof of Alignment" (Simulated zk-SNARK)
     * In a production environment, this would involve a circuit-based proof.
     */
    generateProof(intent: string, action: string, privateContext: any): ZKProof;
    /**
     * Verifies the ZK proof against the public intent.
     */
    verifyProof(proof: ZKProof, publicIntent: string): boolean;
}
//# sourceMappingURL=zkp.d.ts.map