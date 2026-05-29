import { AgentMCP } from '@elenx/mcp-server';
import { MissionControlUI, LineageGraph } from '@elenx/core';
export declare class SelfHealingKernel {
    private browser;
    private scraper;
    private mcp;
    private triage;
    private sovereign;
    private tui;
    private lineage;
    private memory;
    private analyzer;
    private toolDependencyMatrix;
    constructor(mcp: AgentMCP, tui: MissionControlUI, lineage: LineageGraph);
    private logToLedger;
    boot(): Promise<void>;
    executeVerifiedTask(intent: string, url: string, selector: string, callerId?: string): Promise<import("./browser.js").ScrapingResult>;
    private triggerHITL;
    private heal;
}
//# sourceMappingURL=kernel.d.ts.map