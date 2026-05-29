"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
console.log('\x1b[36m' + `
  ███████╗██╗     ███████╗███╗   ██╗██╗  ██╗
  ██╔════╝██║     ██╔════╝████╗  ██║╚██╗██╔╝
  █████╗  ██║     █████╗  ██╔██╗ ██║ ╚███╔╝ 
  ██╔══╝  ██║     ██╔══╝  ██║╚██╗██║ ██╔██╗ 
  ███████╗███████╗███████╗██║ ╚████║██╔╝ ██╗
  ╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝
` + '\x1b[0m');
console.log('\x1b[35m[SIF]\x1b[0m CLI Monitor Initialized v1.0.0');
console.log('Intercepting Semantic Compliance payloads...');
console.log('Listening for MCP Ledger events...\n');
const ledgerPath = path_1.default.resolve(__dirname, '../../mcp-server/logs/ledger.json');
let lastIndex = -1;
setInterval(() => {
    if (!fs_1.default.existsSync(ledgerPath))
        return;
    try {
        const content = fs_1.default.readFileSync(ledgerPath, 'utf8');
        if (!content)
            return;
        const chain = JSON.parse(content);
        for (let i = 0; i < chain.length; i++) {
            const entry = chain[i];
            if (entry.index > lastIndex) {
                if (entry.data && entry.data.type) {
                    const time = new Date(entry.timestamp).toLocaleTimeString();
                    if (entry.data.type === 'mcp_intent_established') {
                        console.log(`\x1b[90m[${time}]\x1b[0m \x1b[36m[ROOT INTENT]\x1b[0m ${entry.data.intent}`);
                    }
                    else if (entry.data.type === 'mcp_block') {
                        console.log(`\x1b[90m[${time}]\x1b[0m \x1b[31m[ACTION BLOCKED]\x1b[0m Caller: ${entry.data.callerId}`);
                        console.log(`  \x1b[31mReason:\x1b[0m ${entry.data.reason}`);
                        console.log(`  \x1b[31mPayload:\x1b[0m ${entry.data.action}`);
                    }
                    else if (entry.data.type === 'mcp_approval') {
                        console.log(`\x1b[90m[${time}]\x1b[0m \x1b[32m[ACTION APPROVED]\x1b[0m Caller: ${entry.data.callerId}`);
                    }
                }
                lastIndex = entry.index;
            }
        }
    }
    catch (e) {
        // file might be in the middle of a write
    }
}, 500);
//# sourceMappingURL=monitor.js.map