# ELENX: Universal Development Plan (2026-2027)
**Roadmap:** Transitioning from MVP to Billion-Dollar Infrastructure

This document outlines the 12-month engineering plan to capture the B2C, B2B, and B2G markets by integrating the full spectrum of Bright Data's 2026 AI product suite.

---

## 🚀 Phase 1: B2B Enterprise Domination (Q3 2026)
**Goal:** Become the default "Supply Chain Guard" for corporate agentic workflows.

### 1. The "Web Unblocker" Markdown Integration
*   **Current State:** We use the Scraping Browser for all web access.
*   **The Upgrade:** Integrate Bright Data's **Web Unblocker** API. We will request the `output_format=markdown` header to convert messy HTML into LLM-ready markdown instantly.
*   **The Value:** This reduces inference costs by 60% and latency by 400ms, making ELENX the fastest way for enterprise RAG agents to ingest clean, verified data.

### 2. Multi-Node Tool Lineage
*   **Current State:** Lineage guard protects against single-hop poisoning (Exa -> Shell).
*   **The Upgrade:** Implement a **Directed Acyclic Graph (DAG)** in the `ElenxKernel` to trace data provenance across 10+ tool hops, ensuring deep enterprise workflows remain uncorrupted.

---

## 🌐 Phase 2: B2C Consumer Sovereignty (Q4 2026)
**Goal:** Provide the "Persistent Trust" layer for personal AI assistants.

### 1. Bright Data "Web MCP" Integration
*   **Current State:** We provide our own custom MCP tools.
*   **The Upgrade:** Integrate directly with the **Bright Data Web MCP**. This allows consumer agents to translate natural language (e.g., "Find the cheapest flights") into unblockable web navigation natively.
*   **The Value:** Users get out-of-the-box, natural language web access that is automatically scrubbed by ELENX before reaching their personal assistant.

### 2. ISP Proxy Session Persistence
*   **Current State:** Dynamic rotating proxies.
*   **The Upgrade:** Implement **Bright Data ISP Proxies** (Static Residential IPs).
*   **The Value:** Allows personal consumer agents to stay securely logged into sensitive accounts (banking, e-commerce) 24/7 without triggering "Suspicious Login" fraud alerts.

---

## 🏛️ Phase 3: B2G Regulatory Monopolization (Q1 2027)
**Goal:** Become the mandatory "System of Record" for EU AI Act compliance.

### 1. Deep Lookup Historical Auditing
*   **Current State:** Bifurcation compares live UI against a fresh "Golden Schema."
*   **The Upgrade:** Integrate Bright Data's **Deep Lookup** API.
*   **The Value:** ELENX will instantaneously query massive web archives. If a government contractor's website behavior deviates from its 3-year historical pattern, ELENX flags a "0-Day Semantic Hijack," providing predictive national defense.

### 2. Enterprise Ledger Syndication (Blockchain Integration)
*   **Current State:** The Transactional Ledger is stored locally in `logs/ledger.json`.
*   **The Upgrade:** Syndicate the hash-chain to a public or permissioned blockchain (e.g., Ethereum or Hyperledger).
*   **The Value:** Provides decentralized, mathematically unforgeable proof of agent intent, fulfilling the strictest "machine-readable evidence" requirements for **FedRAMP CR26** and **CMMC 2.0**.

---

## Summary of Expansion

| Phase | Target Market | Bright Data Integration | ELENX Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 1** | B2B (Enterprise) | Web Unblocker (Markdown) | RAG Triage Engine |
| **Phase 2** | B2C (Consumer) | Web MCP & ISP Proxies | Sovereign Daily Assistant |
| **Phase 3** | B2G (Government)| Deep Lookup | Predictive Threat Ledger |

**Conclusion:** ELENX is not building a security tool; we are building the regulatory and technical infrastructure for the entire autonomous economy.
