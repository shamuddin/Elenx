/**
 * ELENX "Command Center" TUI Rendering Engine
 * High-fidelity, multi-pane layout inspired by 'Awesome TUIs' (k9s, lazygit).
 * Implements throttled double-buffering and Unicode Box-Drawing for professional aesthetics.
 */
export declare class MissionControlUI {
    private terminalWidth;
    private terminalHeight;
    private logs;
    private telemetry;
    private isDirty;
    private renderInterval;
    private isSilent;
    constructor(options?: {
        silent?: boolean;
    });
    updateTelemetry(key: string, value: string): void;
    getTelemetry(key: string): string;
    newSection(title: string): void;
    addLog(message: string, type?: 'info' | 'success' | 'warning' | 'danger'): void;
    private stripAnsi;
    private draw;
    alert(title: string, message: string): Promise<void>;
}
//# sourceMappingURL=tui.d.ts.map