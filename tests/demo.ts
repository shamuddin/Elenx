import { ElenxKernel } from '../src/index.js';

async function runTestDemo() {
    const elenx = new ElenxKernel();
    await elenx.boot();

    console.log('\x1b[1m\x1b[34m%s\x1b[0m', '🧪 RUNNING ELENX INTEGRATION TEST...');

    await elenx.runAutonomousWorkflow('Test Action', 'https://example.com', 'body');

    await elenx.finalizeSession();
    console.log('\x1b[1m\x1b[32m%s\x1b[0m', '\n🎉 HACKATHON DEMO COMPLETE: ELENX PROTECTED THE ENTERPRISE!');
}

runTestDemo().catch(console.error);
