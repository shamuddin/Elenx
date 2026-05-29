const { SemanticAnalyzer } = require('./packages/sdk/dist/analyzer.js');
const fs = require('fs');
const path = require('path');

async function testAll() {
    const analyzer = new SemanticAnalyzer();
    // Read scenarios
    const content = fs.readFileSync(path.join(__dirname, 'packages/mission-control-ui/src/data/scenarios.ts'), 'utf8');
    // Extract array
    const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
    const scenarios = eval(jsonStr);

    let blockedCount = 0;
    let safeCount = 0;
    
    for (const scenario of scenarios) {
        if (scenario.type === 'positive') {
            const result = await analyzer.verifyIntentConsistency(scenario.intent, scenario.action);
            if (result.score < 0.6) {
                console.log(`[BLOCKED] Intent: ${scenario.intent}`);
                console.log(`          Action: ${scenario.action}`);
                console.log(`          Reason: ${result.reason}`);
                blockedCount++;
            } else {
                safeCount++;
            }
        }
    }
    console.log(`Total Positive: ${safeCount + blockedCount}`);
    console.log(`Blocked: ${blockedCount}`);
}

testAll().catch(console.error);
