/**
 * ELENX "Minimalist Glass" TUI Rendering Engine (Optimized)
 * Implements throttled rendering to eliminate flickering.
 */
export declare class MissionControlUI {
    private terminalWidth;
    private terminalHeight;
    private logs;
    private telemetry;
    private isDirty;
    private renderInterval;
    constructor();
    updateTelemetry(key: string, value: string): void;
    addLog(message: string, type?: 'info' | 'success' | 'warning' | 'danger'): void;
    private stripAnsi;
    /**
     * Internal draw method called by the render loop.
     */
    private draw;
    alert(title: string, message: string): Promise<void>;
}
//# sourceMappingURL=tui.d.ts.map