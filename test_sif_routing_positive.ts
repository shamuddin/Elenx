import { io } from 'socket.io-client';

console.log('Testing SIF Graph Routing - Positive Scenario...');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('Connected to API Server.');
    
    // Initialize the MCP terminal
    socket.emit('init', { type: 'mcp', cols: 80, rows: 24 });
    
    // Send Root Intent
    setTimeout(() => {
        console.log('Sending Root Intent...');
        const intentPayload = JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
                name: "set_root_intent",
                arguments: { intent: "Go to chase.com and check my account balance." }
            }
        });
        socket.emit('data', intentPayload + '\r');
    }, 1000);
    
    // Send Verify Action (simulating safe action)
    setTimeout(() => {
        console.log('Sending Safe Verify Action...');
        const actionPayload = JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "verify_action",
                arguments: {
                    action: '<button>Check Balance</button>',
                    target: "DOM",
                    callerId: "autonomous-agent",
                    url: "chase.com"
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

socket.on('disconnect', () => {
    console.log('Disconnected');
});
