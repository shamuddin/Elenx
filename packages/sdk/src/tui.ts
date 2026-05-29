/**
 * ELENX "Command Center" TUI Rendering Engine
 * High-fidelity, multi-pane layout inspired by 'Awesome TUIs' (k9s, lazygit).
 * Implements throttled double-buffering and Unicode Box-Drawing for professional aesthetics.
 */

export class MissionControlUI {
    private terminalWidth: number = process.stdout.columns || 100;
    private terminalHeight: number = process.stdout.rows || 30;
    private logs: { message: string, type: string, timestamp: string }[] = [];
    private telemetry: Record<string, string> = {
        "Sovereignty": "🟢 SECURE",
        "Proxy": "Bright Data US",
        "Latency": "0ms",
        "Bifurcation": "🔍 SCANNING",
        "NHI-ID": "AWAITING",
        "Ledger": "00000000",
        "Threats": "0",
        "Heals": "0",
        "Mode": "OFFLINE",
        "Chain": "✅ CLEAN",
        "Memory Conn": process.env.COGNEE_API_KEY ? "🟢 ACTIVE" : "🟢 ACTIVE (SIMULATED)",
        "Latency Lift": "+0%"
    };
    private isDirty: boolean = true;
    private renderInterval: any = null;
    private isSilent: boolean = false;

    constructor(options: { silent?: boolean } = {}) {
        this.isSilent = options.silent || process.env.ELENX_SILENT_TUI === 'true';

        if (!this.isSilent) {
            process.stdout.write("\x1b[?25l"); // Hide cursor
            process.stdout.write("\x1b[2J");   // Clear screen
            
            process.stdout.on('resize', () => {
                this.terminalWidth = process.stdout.columns;
                this.terminalHeight = process.stdout.rows;
                this.isDirty = true;
            });

            this.renderInterval = setInterval(() => {
                if (this.isDirty) {
                    this.draw();
                    this.isDirty = false;
                }
            }, 100);
        }

        process.on('exit', () => {
            if (this.renderInterval) clearInterval(this.renderInterval);
            if (!this.isSilent) {
                process.stdout.write("\x1b[?25h"); // Show cursor
                process.stdout.write("\x1b[2J\x1b[H"); 
            }
        });
    }

    public updateTelemetry(key: string, value: string) {
        this.telemetry[key] = value;
        this.isDirty = true;
    }

    public getTelemetry(key: string): string {
        return this.telemetry[key] || "0";
    }

    public newSection(title: string) {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const divider = `\x1b[1m\x1b[38;5;239m─── [ SESSION: ${title} @ ${timestamp} ] ──────────────────────────────────────────\x1b[0m`;
        this.logs.push({ message: divider, type: 'info', timestamp: '' });
        
        const maxLogs = this.terminalHeight - 10;
        if (this.logs.length > maxLogs) {
            this.logs.shift();
        }
        this.isDirty = true;
    }

    public addLog(message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.logs.push({ message, type, timestamp });
        
        const maxLogs = this.terminalHeight - 10;
        if (this.logs.length > maxLogs) {
            this.logs.shift();
        }
        this.isDirty = true;
    }

    private stripAnsi(str: string): string {
        return str.replace(/\x1b\[[0-9;]*m/g, "");
    }

    private draw() {
        if (this.isSilent) return;
        let out = "\x1b[H"; // Home
        const w = this.terminalWidth;
        const h = this.terminalHeight;

        // 1. TOP BRAND BAR
        const brand = " 🛡️  ELENX MISSION CONTROL v1.0 ";
        const systemInfo = ` [ ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ] `;
        out += `\x1b[48;5;234m\x1b[38;5;33m\x1b[1m${brand}\x1b[0m`;
        out += `\x1b[48;5;234m\x1b[38;5;244m${" ".repeat(Math.max(0, w - brand.length - systemInfo.length))}${systemInfo}\x1b[0m\n`;

        // 2. GRID PRE-CALCULATION
        const gridKeys = Object.keys(this.telemetry).filter(k => k !== "ROI" && k !== "Latency Lift" && k !== "Threats" && k !== "Mode");
        const cols = w > 120 ? 3 : (w > 80 ? 2 : 1);
        const gridHeight = Math.ceil(gridKeys.length / cols);
        const contentHeight = h - 8 - gridHeight;

        // 3. MAIN LOG PANE (FULL WIDTH)
        out += `\x1b[38;5;238m┌─\x1b[1m\x1b[38;5;250m INTEGRITY STREAM \x1b[0m\x1b[38;5;238m${"─".repeat(Math.max(0, w - 20))}┐\x1b[0m\n`;

        for (let i = 0; i < contentHeight; i++) {
            let logLine = "";
            const log = this.logs[i];
            if (log) {
                let symbol = "•";
                let color = "\x1b[38;5;244m";
                if (log.type === 'success') { symbol = "✔"; color = "\x1b[38;5;76m"; }
                else if (log.type === 'warning') { symbol = "➜"; color = "\x1b[38;5;214m"; }
                else if (log.type === 'danger') { symbol = "✘"; color = "\x1b[38;5;196m\x1b[1m"; }
                
                const time = `\x1b[38;5;239m${log.timestamp}\x1b[0m`;
                logLine = ` ${color}${symbol}\x1b[0m ${time} ${color}${log.message}\x1b[0m`;
            }
            
            const plainLogLine = this.stripAnsi(logLine);
            out += `\x1b[38;5;238m│\x1b[0m${logLine}${" ".repeat(Math.max(0, w - plainLogLine.length - 2))}\x1b[38;5;238m│\x1b[0m\n`;
        }
        out += `\x1b[38;5;238m└${"─".repeat(Math.max(0, w - 2))}┘\x1b[0m\n`;

        // 4. BOTTOM INFO BAR
        const modeLabel = ` MODE: ${this.telemetry["Mode"]} `;
        const threatCount = ` THREATS NEUTRALIZED: ${this.telemetry["Threats"] || "0"} `;
        const liftValue = this.telemetry["Latency Lift"] || "+0%";
        const barMetrics = ` LATENCY LIFT: ${liftValue} `;
        
        out += `\x1b[48;5;236m\x1b[38;5;250m${modeLabel}\x1b[38;5;196m\x1b[1m${threatCount}\x1b[0m`;
        out += `\x1b[48;5;236m\x1b[38;5;76m${" ".repeat(Math.max(0, w - modeLabel.length - threatCount.length - barMetrics.length))}${barMetrics}\x1b[0m\n`;

        // 5. TELEMETRY HUB (BOTTOM GRID)
        out += `\x1b[38;5;238m┌─\x1b[1m\x1b[38;5;250m TELEMETRY HUB (SOVEREIGN STACK) \x1b[0m\x1b[38;5;238m${"─".repeat(Math.max(0, w - 36))}┐\x1b[0m\n`;
        
        const colWidth = Math.floor((w - 2) / cols);

        for (let i = 0; i < gridHeight; i++) {
            let row = "│";
            for (let j = 0; j < cols; j++) {
                const idx = i * cols + j;
                if (idx < gridKeys.length) {
                    const key = gridKeys[idx]!;
                    const val = this.telemetry[key]!;
                    let valColor = "\x1b[38;5;255m";
                    if (val.includes("🟢") || val.includes("✅") || val.includes("Matched") || val.includes("CLEAN")) valColor = "\x1b[38;5;76m";
                    if (val.includes("🚨") || val.includes("☣️") || val.includes("Drift") || val.includes("POISONED") || val.includes("HIJACKED") || val.includes("SCANNING") || val.includes("OFFLINE")) valColor = "\x1b[38;5;196m";
                    
                    const cellLabel = `${key.padEnd(12, '.')}`;
                    const cellVal = `${val.substring(0, 14).padEnd(14)}`;
                    row += ` \x1b[1m\x1b[38;5;244m${cellLabel}\x1b[0m ${valColor}${cellVal}\x1b[0m`;
                } else {
                    row += " ".repeat(Math.max(0, colWidth));
                }
            }
            const currentRowPlain = this.stripAnsi(row);
            row += " ".repeat(Math.max(0, w - currentRowPlain.length - 1)) + "│\n";
            out += row;
        }
        out += `\x1b[38;5;238m└${"─".repeat(Math.max(0, w - 2))}┘\x1b[0m\n`;

        // 6. COMMAND LINE
        out += `\x1b[1m\x1b[38;5;33m ELENX \x1b[0m\x1b[38;5;244m› \x1b[0m\x1b[2mWaiting for autonomous action power signature...\x1b[0m\x1b[K`;

        process.stdout.write(out);
    }

    public async alert(title: string, message: string) {
        this.addLog(`${title}: ${message}`, 'danger');
        // Visual flash
        process.stdout.write("\x1b[?5h");
        await new Promise(r => setTimeout(r, 150));
        process.stdout.write("\x1b[?5l");
        this.isDirty = true;
    }
}
