export declare class AgentMCP {
    private server;
    private rootIntent;
    private analyzer;
    private verifiedManifests;
    constructor();
    setRootIntent(intent: string): void;
    verifyAction(action: string, callerId?: string): Promise<{
        isConsistent: boolean;
        message: string;
    }>;
    private setupTools;
    start(): Promise<void>;
}
//# sourceMappingURL=mcp.d.ts.map