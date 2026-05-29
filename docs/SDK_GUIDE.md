# SDK Integration Guide: @elenx/core
**Version:** 1.0.0-alpha.1

The `@elenx/core` SDK provides the foundational logic for the Semantic Integrity Firewall. It is designed for developers who want to integrate de-weaponization directly into their AI agent's execution pipeline.

---

## 📦 Installation

```bash
npm install @elenx/core
```

## 🛠️ Usage

### 1. Semantic DOM Scrubbing
Use the `AdversarialScrubber` to clean a webpage before your agent parses it. This prevents the agent from being hijacked by malicious ARIA labels or alt-text.

```typescript
import { AdversarialScrubber } from '@elenx/core';
import puppeteer from 'puppeteer';

const scrubber = new AdversarialScrubber();
const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto('https://untrusted-site.com');

// Scrub the page before the agent reads it
await scrubber.scrub(page);

// Now your agent can safely read the DOM
const safeDOM = await page.content();
```

### 2. Transactional Intent Verification
Use the `SemanticAnalyzer` to verify if a technical action (like a CSS selector) aligns with the user's high-level goal.

```typescript
import { SemanticAnalyzer } from '@elenx/core';

const analyzer = new SemanticAnalyzer();

const userGoal = "Summarize the latest news on AI.";
const proposedAction = "button.delete_account";

const result = await analyzer.verifyIntentConsistency(userGoal, proposedAction);

if (result.isAdversarial) {
    console.error("BLOCKING ACTION:", result.reason);
} else {
    console.log("Action Approved");
}
```

---

## 🔒 Security Best Practices
*   **Recursive Scrubbing:** Ensure you call `.scrub()` after every major DOM mutation or navigation event.
*   **Shadow DOM:** The SDK automatically traverses Shadow Roots. No extra configuration required.
*   **API Keys:** Ensure your `GOOGLE_API_KEY` is set in your environment variables for LLM-powered analysis.

---
[Return to Index](./INDEX.md)
