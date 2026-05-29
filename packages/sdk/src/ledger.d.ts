/**
 * Transactional Ledger (ELENX Flight Recorder 2.0)
 * Implements cryptographic hash-chaining to ensure audit trail immutability.
 * Includes hardening for remote state syndication.
 */
export interface LedgerEntry {
    index: number;
    timestamp: Date;
    data: any;
    previousHash: string;
    hash: string;
    signature?: string | null;
}
export declare class TransactionalLedger {
    private chainPath;
    constructor(filePath?: string);
    private initializeLedger;
    private calculateHash;
    private createEntry;
    /**
     * Appends a new verified action to the immutable chain and syndicates to remote hub.
     */
    record(data: any, signature?: string | null): LedgerEntry;
    /**
     * Streams the block to a remote ELENX Integrity Hub to prevent local forensics erasure.
     */
    private syndicateToRemote;
    /**
     * Verifies the integrity of the entire audit trail.
     */
    verifyIntegrity(): {
        isValid: boolean;
        brokenIndex?: number;
    };
}
//# sourceMappingURL=ledger.d.ts.map