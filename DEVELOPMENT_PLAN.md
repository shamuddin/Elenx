# Development Plan: ELENX / Semantic Integrity Protocol (SIP)
**Status:** MVP Operational | **Phase:** Phase 1 (Hardening & Protocol)

## Phase 1: The Transactional Integrity Kernel (Weeks 1-2)
*Focus: Hardening the "Rule of Two" and neutralizing 2026 academic vulnerabilities.*

1.  **Zero-Bypass MCP Gateway:**
    *   Implement **Capability Attestation**: Change MCP server to require signed manifests before granting tool access.
    *   **SSPI Detection:** Add origin-authentication to the `sampling` flow to prevent servers from masquerading as users.
2.  **Recursive Semantic Scrubber:**
    *   Upgrade `scrubber.ts` to recursively traverse **Shadow DOM** and `<iframe>` structures (mitigating EchoLeak-style hiding).
    *   Implement **Context-Aware Rewriting**: Optimize prompts to preserve structural ARIA tags while neutralizing intent-directives.
3.  **Transactional Identity (NHI):**
    *   Implement unique session IDs and cryptographically signed action requests in the `Kernel`.

## Phase 2: Infrastructure Enforcement (Weeks 3-4)
*Focus: Real-world wiring to Bright Data moats.*

1.  **Golden Schema Cross-Examination:**
    *   Implement the asynchronous polling logic for **Bright Data DCA**.
    *   Build the "Bifurcation Engine": A logic gate that compares the Scraping Browser DOM against the DCA Golden Schema.
2.  **Jurisdictional IP Gating:**
    *   Integrate Bright Data **Residential Proxies** to enforce geo-fencing for high-stakes actions (EU AI Act compliance).
3.  **Human-in-the-Loop (HITL) Gate:**
    *   Implement the "Trifecta Block": If an agent has Data + Input + Action, trigger a mandatory CLI/Web approval prompt.

## Phase 3: Enterprise Observability (Weeks 5-6)
*Focus: Building the CISO Trust Dashboard.*

1.  **Immutable Audit Trail:**
    *   Transition `audit.json` to a signed/permissioned ledger to prevent "Action Laundering" record tampering.
2.  **SIF Visualizer:**
    *   Build a React-based dashboard showing "Malicious vs. De-weaponized" DOM side-by-side.
3.  **ROI Integrity Reporter:**
    *   Generate automated PDF reports on "Reliability Lift" and neutralized threats for CISO sign-off.

---

## Immediate Next Steps (Implementation Start)
1.  **Refactor `src/mcp.ts`** to include Capability Attestation.
2.  **Update `src/scrubber.ts`** for Recursive Shadow DOM support.
3.  **Harden `src/kernel.ts`** with Transactional Signatures.
