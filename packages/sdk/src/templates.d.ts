/**
 * Sovereign Template Engine for AgentOS
 * Prevents UI Hijacking by rendering high-stakes data into a trusted,
 * deterministic UI instead of interacting with the "Dirty Web" DOM.
 */
export interface SovereignView {
    id: string;
    type: "PAYMENT" | "DELETION" | "CONFIG";
    trustedData: any;
    controls: {
        label: string;
        actionId: string;
    }[];
}
export declare class SovereignTemplateEngine {
    constructor();
    /**
     * Generates a "Sovereign View" from raw data fetched via Bright Data DCA.
     * This view is deterministic and cannot be manipulated by the website.
     */
    generateView(type: "PAYMENT" | "DELETION", rawData: any): SovereignView;
    /**
     * Simulates the agent's interaction with the Sovereign View.
     * This replaces clicking a button in the browser DOM.
     */
    interact(view: SovereignView, actionId: string): Promise<boolean>;
}
//# sourceMappingURL=templates.d.ts.map