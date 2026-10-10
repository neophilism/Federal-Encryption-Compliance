# Federal Encryption Compliance — recovered original development plan and independent-account handoff

**Historical source:** October 6 original nine-milestone first downstream thin-app plan. Numbered 9-milestone original roadmap recovered from the previous conversations and cross-checked with checked-in roadmap and technical documentation. This document preserves original scope and, where applicable, separates later extensions. Technical per-item acceptance language is an engineering elaboration rather than a purported verbatim transcript; a milestone ID is **not** a GitHub PR number.

## Product mandate and governing boundaries

Federally focused **downstream policy application** of generic Compliance Authorization Immutable Audit Engine. The policy bundle defines government and contractor encryption obligations, approved cryptographic controls, assessments, waivers, time-bounded exceptions, statutory clocks, OMB/oversight and certification reports. Engine remains statute-neutral; consuming app uses a pinned SDK/API rather than direct engine DB access.

## Original milestone sequence

### FE-01 — Foundation and thin-app boundary

- **Deliverable:** Initialize SDK/version pin, TypeScript/CI, policy configuration, app shell and test tenant; no engine DB coupling.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-02 — Federal Data Encryption policy bundle

- **Deliverable:** Document applicable controls, agencies, contractors and systems; explicit effective rules, legal references and versioning.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-03 — Encryption compliance evaluation

- **Deliverable:** Evidence-backed controls for data states/keys/access/transport; evaluation outputs pass/fail/unknown plus remediation evidence.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-04 — Contractor and external-system compliance

- **Deliverable:** Suppliers, processors, public cloud/external partners, attestations and independent assessment routes.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-05 — Waivers and emergency exceptions

- **Deliverable:** Authorized justifications, exceptional access, short expiry, auditor visibility, escalation and revocation.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-06 — Statutory clocks and oversight

- **Deliverable:** Schedule compliance deadlines, OMB certification, quarterly updates, GAO/IG oversight and corrective actions under versioned rules.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-07 — Findings, remediation and certification

- **Deliverable:** Severity, tracking, verification, exceptions, denial/restrictions and independently reviewable certification.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-08 — Operator UI and reporting

- **Deliverable:** Accessible federal-focused status, dashboards, public-safe releases, evidence trails and required exports.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

### FE-09 — End-to-end abstraction test

- **Deliverable:** Validate complete fictional agency/contractor lifecycle using only typed reusable CAIAE SDK and policy bundle.
- **Acceptance:** Exercise correct transition/report/view, invalid data, permission denial, dependency failures and audit/provenance. Add deterministic unit/integration tests and document migrations, APIs and policy boundaries. Do not mark source/demo/SDK implementation as a live production integration.

## Dependencies and source-of-truth documents

- [docs/roadmap.md](../docs/roadmap.md)
- [docs/architecture.md](../docs/architecture.md)
- [docs/policy-bundle.md](../docs/policy-bundle.md)
- [docs/evaluation-workflow.md](../docs/evaluation-workflow.md)
- [docs/contractors-external-systems.md](../docs/contractors-external-systems.md)
- [docs/statutory-clocks-oversight.md](../docs/statutory-clocks-oversight.md)
- [docs/findings-remediation-certification.md](../docs/findings-remediation-certification.md)

The first nine milestones were previously marked complete in the repository's roadmap, but that does **not** certify real agency compliance. Later PRs added preview deployments, full fictional demo, production validation; check CI, mocks, source validity and actual external connections.

## Execution / release / status rules

1. Read this plan plus the checked-in policy/data model, ADRs, current README and linked runbooks. Discover open and merged actual PRs, CI, image versions, migration versions, release tags, live Render/Neon state and dependent app contract versions; never trust outdated conversational status.
2. Create and maintain a mapping **roadmap ID → GitHub PR(s) → tests → release/deployment evidence**, preserving historical 2026 plan numbering and app-specific changes as separately versioned additions. Only verified merged functionality counts toward development; production evidence is independent.
3. Keep the engine reusable where applicable. Enforce documented negative paths, role/tenant leakage, audit integrity and source validity. Avoid unreviewed policy in upstream code, mock approval of legal obligations, and claims of real-world regulatory compliance from fictional cases.
4. Continue implementation in small chained PRs with required tests, migrations, review of security implications and rollback plan; stop when permissions, credentials, external provider/legal requirements or failing gates make it necessary. Consult the user only for material product and real credentials/authorization decisions.
5. Require real environment health/readiness, DB migrations, backup restoration, media/document storage and malware scanning where applicable, accessibility/security review and demonstrated end-to-end consumer flows before calling a production release complete.

## Recovery confidence

**The original 9 ordered milestones are recovered** and supported by the previous conversation and current repository docs. Current code/CI/live deployment evidence is not established by creating this document.
