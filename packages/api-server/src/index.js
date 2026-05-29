"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const core_1 = require("@elenx/core");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const pty = __importStar(require("node-pty"));
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const identity = new core_1.IdentityRegistry();
const analyzer = new core_1.SemanticAnalyzer();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log(`[PTY] Client connected: ${socket.id}`);
    let ptyProcess = null;
    socket.on('init', (data) => {
        let shell = process.env[process.platform === 'win32' ? 'COMSPEC' : 'SHELL'] || 'powershell.exe';
        let args = [];
        // Custom working directory based on the requested terminal type
        let cwd = process.env.HOME || process.env.USERPROFILE || process.cwd();
        if (data.type === 'mcp' || data.type === 'elenx') {
            cwd = require('path').resolve(process.cwd(), '../mcp-server');
            shell = process.platform === 'win32' ? 'npx.cmd' : 'npx';
            args = ['tsx', 'src/index.ts'];
        }
        else if (data.type === 'monitor') {
            cwd = require('path').resolve(process.cwd(), '../../');
        }
        else if (data.type === 'autonomous') {
            cwd = require('path').resolve(process.cwd(), '../../');
        }
        ptyProcess = pty.spawn(shell, args, {
            name: 'xterm-color',
            cols: data.cols || 80,
            rows: data.rows || 24,
            cwd: cwd,
            env: process.env
        });
        ptyProcess.onData((data) => {
            socket.emit('data', data);
        });
        ptyProcess.onExit((e) => {
            console.log(`[PTY] Process exited with code ${e.exitCode}`);
            socket.emit('data', '\r\n[Process Exited]\r\n');
        });
        // Auto-start commands
        setTimeout(() => {
            if (ptyProcess) {
                if (data.type === 'mcp' || data.type === 'elenx') {
                    ptyProcess.write('npx tsx src/index.ts\r');
                }
                else if (data.type === 'monitor') {
                    ptyProcess.write('echo "Starting ELENX CLI Monitor..." && npx tsx packages/api-server/src/monitor.ts\r');
                }
            }
        }, 1500);
    });
    socket.on('data', (data) => {
        if (ptyProcess)
            ptyProcess.write(data);
    });
    socket.on('resize', (size) => {
        if (ptyProcess) {
            try {
                ptyProcess.resize(size.cols, size.rows);
            }
            catch (e) {
                // Ignore resize errors
            }
        }
    });
    socket.on('disconnect', () => {
        console.log(`[PTY] Client disconnected: ${socket.id}`);
        if (ptyProcess)
            ptyProcess.kill();
    });
});
// 1. Secure Proxy: Scrubbing (For ChatGPT/Custom Bots)
app.post('/api/v1/scrub', async (req, res) => {
    try {
        const { metadata } = req.body;
        if (!metadata || !Array.isArray(metadata)) {
            return res.status(400).json({ error: "Invalid metadata array" });
        }
        const results = [];
        for (const text of metadata) {
            const analysis = await analyzer.analyzeDirective(text);
            results.push({
                original: text,
                isAdversarial: analysis.isAdversarial,
                reason: analysis.reason,
                safeContent: analysis.isAdversarial ? '[NEUTRALIZED_BY_SIF]' : text
            });
        }
        res.json({
            status: "success",
            timestamp: new Date(),
            data: results
        });
    }
    catch (e) {
        res.status(500).json({ error: "Internal Analysis Error", message: e.message });
    }
});
// 2. Secure Proxy: Verification (For Extension/Custom Bots)
app.post('/api/v1/verify', async (req, res) => {
    try {
        const { intent, action } = req.body;
        console.log(`[ELENX-API] Verifying: '${action}' for intent: '${intent}'`);
        const verification = await analyzer.verifyIntentConsistency(intent, action);
        res.json({
            status: verification.score > 0.6 ? "approved" : "blocked",
            timestamp: new Date(),
            details: verification
        });
    }
    catch (e) {
        res.status(500).json({ error: "Internal Verification Error", message: e.message });
    }
});
// --- Telemetry Broadcaster ---
const ledgerPath = require('path').resolve(__dirname, '../../mcp-server/logs/ledger.json');
let lastLedgerIndex = -1;
setInterval(() => {
    try {
        if (!require('fs').existsSync(ledgerPath))
            return;
        const content = require('fs').readFileSync(ledgerPath, 'utf8');
        if (!content)
            return;
        const chain = JSON.parse(content);
        for (let i = 0; i < chain.length; i++) {
            const entry = chain[i];
            if (entry.index > lastLedgerIndex) {
                if (entry.data && entry.data.type) {
                    const event = {
                        id: entry.hash.substring(0, 8),
                        action: entry.data.action || entry.data.intent || entry.data.title || "SYSTEM_EVENT",
                        target: entry.data.target || "DOM",
                        info: entry.data.reason || entry.data.intent || "",
                        timestamp: new Date(entry.timestamp).toISOString(),
                        status: entry.data.type === 'mcp_block' ? 'BLOCK' : (entry.data.type === 'mcp_approval' ? 'ALLOW' : 'ALLOW')
                    };
                    io.emit('SIF_TELEMETRY', event);
                }
                lastLedgerIndex = entry.index;
            }
        }
    }
    catch (e) {
        // Ignore JSON parse errors during write
    }
}, 500);
httpServer.listen(port, () => {
    console.log(`\n\x1b[35m🛡️ ELENX Secure Proxy API live at http://localhost:${port}\x1b[0m`);
    console.log(`\x1b[36m[SIF] Ready to de-weaponize web data for remote agents.\x1b[0m\n`);
});
//# sourceMappingURL=index.js.map