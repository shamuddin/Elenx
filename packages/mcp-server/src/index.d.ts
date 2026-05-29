export declare class AgentMCP {
    private server;
    private rootIntent;
    private analyzer;
    private zkEngine;
    private ledger;
    private verifiedManifests;
    private kernel;
    private sessionStarted;
    constructor();
    private ensureSessionStarted;
    setKernel(kernel: any): void;
    setRootIntent(intent: string): void;
    verifyAction(action: string, callerId?: string, args?: any): Promise<{
        isConsistent: boolean;
        message: string;
    }>;
    private setupTools;
    start(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map