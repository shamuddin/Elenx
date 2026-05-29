import * as crypto from 'crypto';

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
    origin?: "TRUSTED_INTERNAL" | "UNTRUSTED_WEB"; // The Lineage tag
}

export class IdentityRegistry {
    private registry: Map<string, AgentCertificate> = new Map();

    constructor() {}

    /**
     * Registers a new agent or tool and issues a 24-hour RSA certificate.
     */
    public registerAgent(agentName: string, permissions: string[], origin: "TRUSTED_INTERNAL" | "UNTRUSTED_WEB" = "TRUSTED_INTERNAL"): { certificate: AgentCertificate, privateKey: string } {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
        });

        const id = `NHI-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const certificate: AgentCertificate = {
            id,
            publicKey: publicKey.export({ type: 'spki', format: 'pem' }) as string,
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
            permissions,
            origin
        };

        this.registry.set(id, certificate);
        console.error(`\x1b[32m[NHI-Registry] Attested ${origin}: ${id} (${agentName})\x1b[0m`);
        
        return { 
            certificate, 
            privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string 
        };
    }

    /**
     * Signs an action using the agent's private key.
     */
    public signAction(action: any, privateKey: string): string {
        const sign = crypto.createSign('SHA256');
        sign.update(JSON.stringify(action));
        sign.end();
        return sign.sign(privateKey, 'hex');
    }

    /**
     * Verifies the authenticity of an agent's action.
     */
    public verifyAction(action: any, signature: string, certificate: AgentCertificate): boolean {
        const verify = crypto.createVerify('SHA256');
        verify.update(JSON.stringify(action));
        verify.end();
        return verify.verify(certificate.publicKey, signature, 'hex');
    }
}
