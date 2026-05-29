import { ElenxKernel } from '../src/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function getRealWikipediaContent() {
    console.log('--- FETCHING REAL WIKIPEDIA CONTENT VIA SCRAPING BROWSER ---');
    
    const kernel = new ElenxKernel();
    await kernel.boot();
    
    const intent = "Read Wikipedia to summarize Artificial Intelligence";
    const url = "https://en.wikipedia.org/wiki/Artificial_intelligence";

    // We use a selector that isn't 'body' to force the full Scraping Browser path 
    // which uses the BRIGHTDATA_BROWSER_PASSWORD (which we have).
    console.log('\n[Action]: Executing Verified Task...');
    const result = await kernel.runAutonomousWorkflow(intent, url, "p");

    if (result.success) {
        console.log('\n✅ REAL DATA RETRIEVED');
        console.log('--- START DATA ---');
        console.log(result.data || result.content);
        console.log('--- END DATA ---');
    } else {
        console.log('\n❌ FAILED to retrieve real data.');
        console.log('Reason:', result.content);
    }
    
    await kernel.finalizeSession();
    process.exit(0);
}

getRealWikipediaContent().catch(console.error);
