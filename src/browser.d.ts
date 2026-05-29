import { Page } from 'puppeteer-core';
export interface ScrapingResult {
    success: boolean;
    content?: string;
    error?: string;
    screenshotPath?: string;
    scrubberReport?: any;
}
export declare class BrightDataBrowser {
    private wsEndpoint;
    private scrubber;
    private customerId;
    private zoneName;
    private ispZoneName;
    private browserPassword;
    private ispPassword;
    constructor();
    /**
     * Executes a task with optional session persistence via ISP Proxies.
     */
    execute(url: string, task: (page: Page) => Promise<any>, options?: {
        countryCode?: string;
        persistent?: boolean;
        sessionId?: string;
    }): Promise<ScrapingResult>;
    private applyHumanMimicry;
}
//# sourceMappingURL=browser.d.ts.map