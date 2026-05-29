import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { IdentityRegistry, SemanticAnalyzer } from '@elenx/core';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as pty from 'node-pty';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const identity = new IdentityRegistry();
const analyzer = new SemanticAnalyzer();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`[PTY] Client connected: ${socket.id}`);
    
    let ptyProcess: pty.IPty | null = null;
    
    socket.on('init', (data) => {
        let shell = process.env[process.platform === 'win32' ? 'COMSPEC' : 'SHELL'] || (process.platform === 'win32' ? 'powershell.exe' : '/bin/sh');
        let args: string[] = [];
        
        // Custom working directory based on the requested terminal type
        let cwd = process.env.HOME || process.env.USERPROFILE || process.cwd();
        
        if (data.type === 'mcp' || data.type === 'elenx') {
            cwd = require('path').resolve(process.cwd(), '../mcp-server');
        } else if (data.type === 'monitor') {
            cwd = require('path').resolve(process.cwd(), '../../');
        } else if (data.type === 'autonomous') {
            cwd = require('path').resolve(process.cwd(), '../../');
        }

        ptyProcess = pty.spawn(shell, args, {
            name: 'xterm-color',
            cols: data.cols || 80,
            rows: data.rows || 24,
            cwd: cwd,
            env: process.env as any
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
                } else if (data.type === 'monitor') {
                    ptyProcess.write('echo "Starting ELENX CLI Monitor..." && npx tsx packages/api-server/src/monitor.ts\r');
                }
            }
        }, 1500);
    });

    socket.on('data', (data) => {
        if (ptyProcess) ptyProcess.write(data);
    });

    socket.on('resize', (size) => {
        if (ptyProcess) {
            try {
                ptyProcess.resize(size.cols, size.rows);
            } catch (e) {
                // Ignore resize errors
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`[PTY] Client disconnected: ${socket.id}`);
        if (ptyProcess) ptyProcess.kill();
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
    } catch (e: any) {
        res.status(500).json({ error: "Internal Analysis Error", message: e.message });
    }
});

// 2. Secure Proxy: Verification (For Extension/Custom Bots)
app.post('/api/v1/verify', async (req, res) => {
    try {
        const { intent, action } = req.body;
        console.log(`[ELENX-API] Verifying: '${action}' for intent: '${intent}'`);
        
        const target = typeof req.body === 'object' && req.body !== null && req.body.target ? req.body.target : action;
        const domain = typeof req.body === 'object' && req.body !== null && req.body.url ? req.body.url : "unknown_domain";
        const callerId = typeof req.body === 'object' && req.body !== null && req.body.callerId ? req.body.callerId : "system";

        // Pre-Phase 2: Check Cognee Memory for known threats
        try {
            const recallRes = await fetch('http://127.0.0.1:8001/recall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, selector: target })
            });
            if (recallRes.ok) {
                const recallData = await recallRes.json();
                if (recallData.results && recallData.results.length > 0) {
                    const msg = "[Cognee Memory] Known Threat Detected! Pattern matched past adversarial selector.";
                    
                    io.emit('SIF_TELEMETRY', {
                        id: Math.random().toString(36).substring(7),
                        action: action,
                        target: target,
                        info: msg,
                        timestamp: new Date().toISOString(),
                        status: 'BLOCK'
                    });

                    return res.json({
                        status: "blocked",
                        timestamp: new Date(),
                        details: {
                            score: 0,
                            reason: msg,
                            isAdversarial: true
                        }
                    });
                }
            }
        } catch (e: any) {
            console.error("\x1b[33m[Knowledge Fabric] Failed to recall from cognee:", e.message, "\x1b[0m");
        }

        const verification = await analyzer.verifyIntentConsistency(intent, action);
        
        try {
            await fetch('http://127.0.0.1:8001/remember', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: domain,
                    selector: target,
                    intent: intent,
                    reason: verification.reason,
                    caller_id: callerId,
                    status: verification.score > 0.6 ? "ALLOW" : "BLOCK"
                })
            });
        } catch (e: any) {}

        res.json({
            status: verification.score > 0.6 ? "approved" : "blocked",
            timestamp: new Date(),
            details: verification
        });
    } catch (e: any) {
        res.status(500).json({ error: "Internal Verification Error", message: e.message });
    }
});

// --- Telemetry Broadcaster ---
const ledgerPath = require('path').resolve(__dirname, '../../mcp-server/logs/ledger.json');
let lastLedgerIndex = -1;

setInterval(() => {
    try {
        if (!require('fs').existsSync(ledgerPath)) return;
        const content = require('fs').readFileSync(ledgerPath, 'utf8');
        if (!content) return;
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
    } catch (e) {
        // Ignore JSON parse errors during write
    }
}, 500);

httpServer.listen(port, () => {
    console.log(`\n\x1b[35m🛡️ ELENX Secure Proxy API live at http://localhost:${port}\x1b[0m`);
    console.log(`\x1b[36m[SIF] Ready to de-weaponize web data for remote agents.\x1b[0m\n`);
});
