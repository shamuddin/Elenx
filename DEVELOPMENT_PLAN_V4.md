# ELENX Development Plan V4: Sovereign Integrity & Security Memory
**Version:** 4.0.0 (May 2026)  
**Status:** PLANNING - Partner Integration Phase  

---

## 1. Executive Summary
ELENX is evolving from a stateless "Scrub-and-Gate" firewall into a **Sovereign Integrity Plane** with long-term memory. This plan details the integration of **Cognee** for semantic threat memory and **AI/ML API** for model-agnostic consensus, ensuring ELENX remains the gold standard for agentic security.

## 2. Technical Partner Integrations

### 2.1 Cognee: The "Security Memory" Layer
*   **Source:** [topoteretes/cognee](https://github.com/topoteretes/cognee)
*   **Role:** Knowledge Graph-based persistence for semantic threats.
*   **Integration Goal:** Replace `reputation_cache.json` with a structured graph.
    *   **Vector Search:** Quickly retrieve similar past hijacking patterns.
    *   **Relationship Mapping:** Link specific "malicious selectors" to known "adversarial domains."
*   **Implementation:** 
    *   Initialize Cognee with a persistent vector store.
    *   On every blocked action, "index" the semantic pattern into Cognee.
    *   Before every verification, "query" Cognee for historical matches.

### 2.2 AI/ML API: The "Redundant Skeptic"
*   **Role:** Multi-model redundancy for the "Rule of Two" Consensus.
*   **Integration Goal:** Use an independent model (e.g., Llama-3-Guard) as the adversarial auditor.
*   **Logic:**
    1.  **Primary:** Gemini (Internal).
    2.  **Skeptic:** AI/ML API (External Llama/Claude).
    3.  **Fallback:** If AI/ML API fails (latency/timeout), fall back to a high-temperature Gemini "Skeptic" prompt.
*   **Requirement:** ALL keys must be sourced from `.env`.

## 3. Implementation Roadmap

### Phase 1: Environment & Infrastructure (Current)
- [ ] Add `COGNEE_API_KEY` and `AIML_API_KEY` to `.env.example`.
- [ ] Install Cognee SDK and necessary AI/ML API clients.

### Phase 2: Security Memory (Cognee)
- [ ] Replace `reputation_cache.json` with a Cognee-managed vector/graph store.
- [ ] Implement `SovereignMemoryEngine` in `src/kernel.ts`.
- [ ] Create a "Threat Ingestion" pipeline to feed Cognee with neutralized semantic payloads.

### Phase 3: Consensus Redundancy (AI/ML API)
- [ ] Implement `AimlApiProvider` in `src/analyzer.ts`.
- [ ] Update `skepticalAudit()` to prefer AI/ML API with a Gemini fallback.
- [ ] Ensure fail-closed logic if both providers are unreachable.

### Phase 4: Validation & Benchmarking
- [ ] Create `tests/integration_partners.ts` to verify full memory/consensus loop.
- [ ] Measure latency overhead (Target: < 800ms for dual-check).

---

## 4. Security Mandate
*   **No Hardcoded Secrets:** All integration points must use `process.env`.
*   **Privacy Preservation:** Ensure PII is scrubbed *before* being indexed into Cognee memory.
*   **Immutable Ledger:** Every memory retrieval and consensus verdict must be signed and recorded in the ELENX Ledger.

---
**Approved by:** ELENX Kernel v4.0.0-Harden
