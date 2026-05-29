/**
 * Non-Human Identity (NHI) Registry for AgentOS
 * Issues and verifies unique cryptographic certificates for autonomous agents.
 */
export interface AgentCertificate {
    id: string;
    publicKey: string;
    issuedAt: Date;
    expiresAt: Date;
    permissions: string[];
    origin?: "TRUSTED_INTERNAL" | "UNTRUSTED_WEB";
}
export declare class IdentityRegistry {
    private registry;
    constructor();
    /**
     * Registers a new agent or tool and issues a 24-hour RSA certificate.
     */
    registerAgent(agentName: string, permissions: string[], origin?: "TRUSTED_INTERNAL" | "UNTRUSTED_WEB"): {
        certificate: AgentCertificate;
        privateKey: string;
    };
    /**
     * Signs an action using the agent's private key.
     */
    signAction(action: any, privateKey: string): string;
    /**
     * Verifies the authenticity of an agent's action.
     */
    verifyAction(action: any, signature: string, certificate: AgentCertificate): boolean;
}
//# sourceMappingURL=identity.d.ts.map