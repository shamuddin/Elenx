const { SemanticAnalyzer } = require('./packages/sdk/dist/analyzer.js');

async function test() {
    const analyzer = new SemanticAnalyzer();
    const intent = "Summarize my unread messages on my dashboard on slack.com.";
    const action = "<div>Unread messages: 5</div>";
    console.log(`Intent: ${intent}`);
    console.log(`Action: ${action}`);
    
    const result = await analyzer.verifyIntentConsistency(intent, action);
    console.log(`Result:`, result);
}

test().catch(console.error);
