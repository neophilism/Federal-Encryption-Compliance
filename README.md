# Federal Encryption Compliance

Federal Encryption Compliance is the first thin downstream application built on the reusable Compliance, Authorization & Immutable Audit Engine:

https://github.com/neophilism/Compliance-Authorization-Immutable-Audit-Engine

The downstream application owns Federal Data Encryption Act policy configuration, schemas, terminology, UI, and genuinely specialized behavior. Reusable compliance infrastructure remains upstream.

## Architecture

~~~
Federal Encryption Compliance
  -> @caiae/sdk
  -> Compliance Engine HTTP API
  -> reusable engine services
  -> PostgreSQL
~~~

This repository does not connect directly to the engine database and does not import engine service/repository internals.

The upstream engine is pinned as a Git submodule at vendor/caiae. Its workspace packages are available to this repository so the currently unpublished @caiae/sdk can be consumed without copying upstream code.

## Development

Clone with submodules:

~~~
git clone --recurse-submodules https://github.com/neophilism/Federal-Encryption-Compliance.git
cd Federal-Encryption-Compliance
npm install
~~~

Configure the engine endpoint:

~~~
cp .env.example .env.local
~~~

Then run:

~~~
npm run dev
~~~

Validation:

~~~
npm run typecheck
npm test
npm run build
~~~

## Upstream boundary

If this first thin app exposes a capability that is genuinely reusable across policy domains, that capability should be implemented in the master engine and the submodule pin updated here. Bill-specific concepts must remain in this repository.

See docs/architecture.md and docs/roadmap.md.


## Policy bundle

The Federal Data Encryption policy package lives at packages/policy and contains:

- statutory authority/source references;
- the versioned declarative ruleset;
- policy-specific resource schemas;
- evidence schemas;
- a safe provisioning CLI.

The source legislation is still treated as draft. Provisioning registers a draft ruleset by default and requires an explicit FDEA_EFFECTIVE_FROM value before activation.

See docs/policy-bundle.md.


## Evaluation workflow

PR 3 adds an SDK-driven evaluation package at packages/evaluation.

The default mode is a draft simulation. It creates a downstream resource and evidence records through the engine API, then asks the upstream engine to evaluate the PR 2 declarative ruleset.

Run the default fixture with:

~~~
npm run evaluation:fixture
~~~

Registered/effective evaluation requires an explicitly activated registered ruleset ID.

See docs/evaluation-workflow.md.


## Contractors and external systems

PR 4 adds the Section 5 partner workflow package at packages/partners.

It models covered contractors, all-tier subcontractor flow-down, existing-agreement compliance actions, periodic contractor evaluation, and cloud/shared/external-system compliance while keeping persistence and audit upstream.

Run the default partner fixture with:

~~~
npm run partners:fixture
~~~

See docs/contractors-external-systems.md.


## Waivers and emergency exceptions

PR 5 adds the Section 7 workflow package at `packages/exceptions`.

It keeps waivers distinct from emergency communications:

- technical-impracticability waivers use the engine's exception/waiver lifecycle;
- classified-system conflicts use a narrow, directive-referenced exception;
- emergency communications use the engine's immediate emergency-authorization lifecycle with a mandatory review deadline.

The downstream layer rejects blanket rule targets and blanket scopes, requires compensating controls for waiver/classified paths, caps each waiver/exception window at one year, and models renewal as a fresh request rather than silently extending an existing authorization.

See `docs/waivers-emergency-exceptions.md`.


## Statutory clocks and oversight

PR 6 adds the Section 4/5/6/11 clock and oversight package at `packages/oversight`.

Persisted deadlines require an explicit enactment timestamp and enactment authority/reference; the draft legislation never acquires a live effective date by default. The package tracks the 180-day NIST deadline, one-calendar-year agency implementation and existing-contract transition limits, the 18-calendar-month GAO evaluation, OMB-selected annual certification dates, three-calendar-month progress updates while an agency remains noncompliant, OMB corrective-action milestones, and explicitly scheduled IG/FISMA reviews.

Calendar years, months, and quarters are calculated as calendar periods rather than fixed 365-day or 90-day shortcuts. The runtime remains on the typed `@caiae/sdk` boundary.

See `docs/statutory-clocks-oversight.md`.


## Findings, remediation, and certification

PR 7 adds the Section 6 accountability workflow at `packages/accountability`.

Failed compliance checks can be synchronized into the reusable engine's finding lifecycle, assigned, disputed, remediated, independently verified, closed, and reopened through the typed `@caiae/sdk` boundary. OMB corrective-action milestones reuse the statutory oversight clocks created by PR 6 rather than creating duplicate deadline state.

The package deliberately distinguishes the statute's annual agency filing from a positive engine certification. A Section 6 filing may truthfully report incomplete compliance and must then include an explanation and remediation plan; it is persisted as an auditable filing resource and triggers quarterly progress clocks until full compliance is reached. Positive `fdea.system-compliance` certificates are separate operational artifacts and can only be issued through the upstream certification lifecycle from a passed supporting check with no unresolved findings.

Annual and quarterly filings use deterministic references and content hashes. An exact retry reuses the same filing, while a changed filing cannot silently overwrite the original and must be handled as an explicit amendment.

See `docs/findings-remediation-certification.md`.


## Federal Encryption UI and reporting

PR 8 replaces the original connectivity shell with a server-rendered operator dashboard at `apps/web`.

The dashboard reads the master engine's compliance report through `@caiae/sdk` and presents Federal-specific operations without recreating engine state machines. It includes:

- agency-wide compliance metrics;
- failed checks and unresolved findings;
- active and overdue deadlines;
- active remediation;
- positive operational certifications;
- active exceptions;
- immutable audit-chain integrity;
- per-resource drill-down reports;
- Section 6 annual certification filings and quarterly progress updates;
- downloadable JSON, CSV, and text compliance reports.

The operator credential is server-side only. Client components cannot read or instantiate operator-authenticated engine clients.

The legal-mode banner is fail-closed. The UI says **Draft / simulation** unless both `FDEA_EFFECTIVE_FROM` and `FDEA_ENACTMENT_REFERENCE` are configured with a valid timestamp/reference.

See `docs/ui-reporting.md`.


## Final abstraction review

PR 9 completes the first thin-app architecture review. Remaining generic
transport gaps discovered while building Federal Encryption—evidence lifecycle,
rendered compliance reports, and engine health—are exposed through the upstream
typed SDK, and downstream runtime code no longer constructs raw engine request
routes.

Architecture tests enforce the boundary: Federal runtime code must use
`@caiae/sdk`, while Federal policy semantics, statutory calendar
interpretation, Section 5/6/7 workflows, filing validation, and UI presentation
remain downstream.

See `docs/abstraction-review.md`.

## Rapid preview deployment

The repository includes a Render Blueprint and smoke-test workflow for rapid visual inspection during development.

The default preview uses a self-contained fictional demo mode and remains legally labeled **Draft / simulation**. It includes representative resources, failures, deadlines, remediation, certifications, Section 6 filings, audit integrity, report exports, and resource drill-downs without requiring real agency data, a database, or an operator credential.

Run the post-deploy smoke check with:

~~~
PREVIEW_BASE_URL=https://federal-encryption-preview.onrender.com npm run preview:smoke
~~~

See `docs/preview-deployment.md`.

