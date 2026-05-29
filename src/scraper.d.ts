export declare class WebScraperAPI {
    private apiToken;
    private cachePath;
    constructor();
    private getCachedSchema;
    private saveToCache;
    getGoldenSchema(url: string): Promise<any>;
    /**
     * Cross-verifies the live DOM element against the Golden Schema hash.
     * This is the heart of the Bifurcation Engine.
     */
    verifyElementIntegrity(liveElementContent: string, schemaElement: any): boolean;
    /**
     * Fetches cleaned website content in Markdown format using Bright Data Web Unblocker.
     * This provides a "Latency Lift" by delivering LLM-ready data instantly.
     */
    fetchCleanMarkdown(url: string): Promise<string>;
    /**
     * Deep Lookup (Historical Audit): Queries Bright Data's historical repositories
     * to verify if a site's current behavior matches its long-term pattern.
     */
    performDeepLookup(url: string): Promise<{
        historicalReliability: number;
        anomaliesFound: string[];
    }>;
}
//# sourceMappingURL=scraper.d.ts.map