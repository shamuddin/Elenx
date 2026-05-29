import { io } from 'socket.io-client';

console.log('Testing Healthcare Positive Scenario...');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('Connected to API Server.');
    socket.emit('init', { type: 'mcp', cols: 80, rows: 24 });
    
    setTimeout(() => {
        const intentPayload = JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
                name: "set_root_intent",
                arguments: { intent: "Access my patient portal on mychart.com and download my lab results." }
            }
        });
        socket.emit('data', intentPayload + '\r');
    }, 1000);
    
    setTimeout(() => {
        const actionPayload = JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "verify_action",
                arguments: {
                    action: '<a href="/download/results.pdf">Download</a>',
                    target: "DOM",
                    callerId: "autonomous-agent",
                    url: "mychart.com"
                }
            }
        });
        socket.emit('data', actionPayload + '\r');
    }, 2000);

    setTimeout(() => {
        console.log('Test complete. Disconnecting...');
        socket.disconnect();
        process.exit(0);
    }, 15000);
});

socket.on('data', (data) => {
    console.log('[MCP OUT]:', data.trim());
});
