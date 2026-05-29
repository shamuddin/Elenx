# ELENX: Security Audit & Hardening Report (2026)
**Status:** Under Active Remediation

This document identifies the "Next-Gen" vulnerabilities in the ELENX (and general agentic security) architecture and tracks the implementation of their respective hardening fixes.

---

## 🚩 Gap 1: The "Silent Bypass" (Voluntary Handshake)
*   **Description:** We currently rely on the agent to voluntarily call `verify_action`. A hijacked agent can simply stop calling the security tool.
*   **Hardening Strategy:** Move to **Transport-Layer Gating**. The technical capability to click/execute must be physically blocked at the proxy level unless a valid ELENX Action Signature is attached to the request.
*   **Status:** ⏳ Pending (Requires custom browser-side proxy hook).

## 🚩 Gap 2: Second-Order Prompt Injection
*   **Description:** The Scrubber uses an LLM. An attacker can "jailbreak" the scrubber via ARIA labels.
*   **Hardening Strategy:** Implement **Structural Separation**. Transition the Scrubber from a general LLM to a hardened, deterministic **Small Language Model (SLM)** or a code-based grammar parser.
*   **Status:** ⏳ Pending.

## 🚩 Gap 3: "Fail-Open" Vulnerability
*   **Description:** If the security API times out or the network drops, the agent might proceed without verification.
*   **Hardening Strategy:** **Fail-Closed Protocol**. If a verification signature is not received within 1000ms, the kernel must force-kill the agent session and revoke its NHI certificate.
*   **Status:** 🚀 **REMEDIATING NOW**.

## 🚩 Gap 4: Data Laundering (Lineage Loss)
*   **Description:** Agents can "clean" poisoned data by writing it to a file and reading it back, breaking the Lineage DAG.
*   **Hardening Strategy:** **Object-Level Tainting**. Every data object in the ELENX memory space carries a persistent "Taint Tag" that survives I/O operations.
*   **Status:** ⏳ Planned.

## 🚩 Gap 5: Local Ledger Erasure
*   **Description:** A hijacked agent with shell access can delete `logs/ledger.json`.
*   **Hardening Strategy:** **Remote State Syndication**. Stream hashes to a write-once remote server or a public blockchain (Ethereum L2).
*   **Status:** 🚀 **REMEDIATING NOW**.

## 🚩 Gap 6: HITL Fatigue
*   **Description:** Users click "Approve" blindly after too many requests.
*   **Hardening Strategy:** **Semantic Differential UI**. Display a high-contrast comparison between the "User's Intent" and the "Site's Attempted Action."
*   **Status:** ⏳ Planned.

---

## Hardening Progress Log
| Date | Fix | Target Gap | Impact |
| :--- | :--- | :--- | :--- |
| 2026-05-26 | Fail-Closed Kernel | Gap 3 | 100% Protection against network-bypass attacks. |
| 2026-05-26 | Immutable Ledger Sync | Gap 5 | Prevents forensic erasure by hijacked agents. |
