# Enterprise Extension Guide: @agentos/browser-extension
**Platform:** Chrome / Edge / Brave

The AgentOS Browser Extension is the ultimate enterprise-wide firewall. It intercepts local agent activity (like *Claude Computer Use* or *OpenAI Operator*) running on your local machine and enforces semantic security at the browser level.

---

## 🛠️ Developer Installation

Currently, the extension is in **Developer Preview**. To install it:

1.  **Open Chrome Extensions:** Navigate to `chrome://extensions/`.
2.  **Enable Developer Mode:** Toggle the switch in the top right.
3.  **Load Unpacked:** Click **"Load unpacked"** and select the `packages/browser-extension` folder in this repo.

---

## 🛡️ Enterprise Governance

The extension provides two core layers of protection:

### 1. The Intercept Plane
Every time an untrusted, automated script attempts to click an element or input text, the extension **pauses the event**. 

### 2. The Verification Handshake
The extension sends the technical action to the **AgentOS Governance Server**. If the server approves, the extension re-dispatches the event. if it denies, the extension **visually highlights the malicious element in red** and blocks the interaction.

---

## 🏢 CISO Oversight
All activity intercepted by the extension is automatically cryptographically signed and sent to your central **AgentOS Trust Portal**, providing a real-time audit trail of all AI activity across the company.

---
[Return to Index](./INDEX.md)
