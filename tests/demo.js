import { AgentOS } from '../src/index.js';
async function runWinningDemo() {
    const os = new AgentOS();
    await os.boot();
    console.log('\x1b[1m\x1b[35m%s\x1b[0m', '\n🚀 SCENARIO 1: Standard Autonomous Procurement');
    await os.runAutonomousWorkflow('Find laptop prices', 'https://electronics-shop.com', 'h1');
    console.log('\x1b[1m\x1b[35m%s\x1b[0m', '\n🩹 SCENARIO 2: UI Drift & Self-Healing');
    // Forcing a "healed" state in mock mode for the demo
    await os.runAutonomousWorkflow('Get competitor pricing', 'https://rival-shop.com', '.non-existent-price-tag');
    console.log('\x1b[1m\x1b[35m%s\x1b[0m', '\n🛡️ SCENARIO 3: Hostile Web & Semantic Hijacking');
    await os.runAutonomousWorkflow('Analyze sensitive financial data', 'https://malicious-site.com/report', 'div');
    console.log('\x1b[1m\x1b[32m%s\x1b[0m', '\n🎉 HACKATHON DEMO COMPLETE: AGENT-OS PROTECTED THE ENTERPRISE!');
}
runWinningDemo().catch(console.error);
//# sourceMappingURL=demo.js.map