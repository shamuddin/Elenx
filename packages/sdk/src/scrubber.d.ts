import { Page } from 'puppeteer-core';
export interface ScrubberReport {
    neutralizedCount: number;
    triageData: {
        original: string;
        safe: string;
        reason: string;
    }[];
}
export declare class AdversarialScrubber {
    private analyzer;
    constructor();
    scrub(page: Page): Promise<ScrubberReport>;
}
//# sourceMappingURL=scrubber.d.ts.map