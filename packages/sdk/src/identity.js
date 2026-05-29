import * as crypto from 'crypto';
export class IdentityRegistry {
    registry = new Map();
    constructor() { }
    /**
     * Registers a new agent or tool and issues a 24-hour RSA certificate.
     */
    registerAgent(agentName, permissions, origin = "TRUSTED_INTERNAL") {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
        });
        const id = `NHI-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const certificate = {
            id,
            publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
            permissions,
            origin
        };
        this.registry.set(id, certificate);
        console.error(`\x1b[32m[NHI-Registry] Attested ${origin}: ${id} (${agentName})\x1b[0m`);
        return {
            certificate,
            privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' })
        };
    }
    /**
     * Signs an action using the agent's private key.
     */
    signAction(action, privateKey) {
        const sign = crypto.createSign('SHA256');
        sign.update(JSON.stringify(action));
        sign.end();
        return sign.sign(privateKey, 'hex');
    }
    /**
     * Verifies the authenticity of an agent's action.
     */
    verifyAction(action, signature, certificate) {
        const verify = crypto.createVerify('SHA256');
        verify.update(JSON.stringify(action));
        verify.end();
        return verify.verify(certificate.publicKey, signature, 'hex');
    }
}
//# sourceMappingURL=identity.js.map