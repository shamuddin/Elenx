import { AgentMCP } from '@elenx/mcp-server';
export declare class ElenxKernel {
    private mcp;
    private kernel;
    private identity;
    private ledger;
    private tui;
    private lineage;
    private systemCert;
    private isMcpManaged;
    private sessionStats;
    private auditLogPath;
    constructor(existingMcp?: AgentMCP);
    private logAudit;
    boot(): Promise<void>;
    log(message: string, type?: 'info' | 'success' | 'warning' | 'danger'): void;
    runAutonomousWorkflow(intent: string, url: string, selector: string, callerId?: string): Promise<import("./browser.js").ScrapingResult>;
    private updateStats;
    finalizeSession(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map