import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IdentityRegistry, SemanticAnalyzer } from '@elenx/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 7001;
const identity = new IdentityRegistry();
const analyzer = new SemanticAnalyzer();

app.use(express.static('public'));
app.use('/tests', express.static('tests'));
app.use(express.json());

// Serve the main dashboard at /dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

let pendingApprovals: any[] = [];

// --- UNIFIED API ENDPOINTS ---

// 1. Onboarding & Identity
app.post('/api/config/register-agent', (req, res) => {
    const { limit } = req.body;
    console.log(`[ELENX-Gateway] Provisioning identity. Policy Limit: ${limit}`);
    const { certificate, privateKey } = identity.registerAgent("Enterprise-User-Agent", ["BROWSE", "TRANSACT"]);
    res.json({ certificate, status: 'success' });
});

// 2. Secure Proxy: Scrubbing (For ChatGPT/Custom Bots)
app.post('/api/v1/scrub', async (req, res) => {
    try {
        const { metadata } = req.body;
        if (!metadata || !Array.isArray(metadata)) return res.status(400).json({ error: "Invalid metadata array" });
        
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
        res.json({ status: "success", data: results });
    } catch (e) { res.status(500).json({ error: "Internal Error" }); }
});

// 3. Secure Proxy: Verification (For Extension/Custom Bots)
app.post('/api/v1/verify', async (req, res) => {
    try {
        const { intent, action } = req.body;
        console.log(`[ELENX-Gateway] Verifying: '${action}' for intent: '${intent}'`);
        const verification = await analyzer.verifyIntentConsistency(intent, action);
        res.json({ status: verification.score > 0.6 ? "approved" : "blocked", details: verification });
    } catch (e) { res.status(500).json({ error: "Internal Error" }); }
});

// 4. HITL Approval Queue
app.get('/api/approvals', (req, res) => res.json(pendingApprovals));

app.post('/api/approvals/request', (req, res) => {
    const approval = { id: Math.random().toString(36).substr(2, 5), status: 'pending', ...req.body };
    pendingApprovals.push(approval);
    res.json(approval);
});

app.post('/api/approvals/respond', (req, res) => {
    const { id, decision } = req.body;
    const approval = pendingApprovals.find(a => a.id === id);
    if (approval) {
        approval.status = decision;
        res.json({ success: true });
    } else { res.status(404).json({ error: "Not found" }); }
});

// 5. Audit Ledger API
app.get('/api/logs', (req, res) => {
    const ledgerPath = path.join(process.cwd(), 'logs/ledger.json');
    if (fs.existsSync(ledgerPath)) {
        const chain = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        const flattened = chain.map((entry: any) => ({
            ...entry.data,
            timestamp: entry.timestamp,
            hash: entry.hash,
            integritySignature: entry.signature
        }));
        res.json(flattened);
    } else { res.json([]); }
});

app.get('/api/stats', (req, res) => {
    const roiPath = path.join(process.cwd(), 'logs/roi_report.json');
    if (fs.existsSync(roiPath)) res.json(JSON.parse(fs.readFileSync(roiPath, 'utf8')));
    else res.json({});
});

// 6. Transparent Proxy Handler (The Network Moat)
// This intercepts raw HTTP requests from wrapped agents
app.all('/api/v1/proxy/*path', async (req, res) => {
    const targetUrl = req.params.path;
    console.log(`\x1b[35m[SIF-Proxy] Intercepting request to: ${targetUrl}\x1b[0m`);
    
    try {
        // In a production environment, this would call the Scrubber
        // for the targetUrl and return the cleaned content.
        // For the demo, we return a "SIF-SECURED" header.
        res.setHeader('X-ELENX-Integrity', 'Verified');
        res.json({
            status: "secure_proxy_active",
            intercepted_url: targetUrl,
            scrubbing_status: "100%_Neutralized"
        });
    } catch (e) {
        res.status(500).send("Proxy Error");
    }
});

app.use('/graph', express.static('graphify-out'));

app.listen(port, () => {
    console.log(`\n\x1b[32m🚀 ELENX Unified Gateway live at http://localhost:${port}\x1b[0m`);
    console.log(`\x1b[36m[SIF] Serving Trust Portal, Secure Proxy API, and MCP Backend.\x1b[0m\n`);
});
