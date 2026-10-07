# Final abstraction review

PR 9 is the final architecture review for Federal Encryption Compliance, the
first downstream application built on the reusable Compliance, Authorization &
Immutable Audit Engine.

The review asks a simple question for every substantial capability:

> Is this behavior reusable compliance infrastructure, or is it specifically
> the Federal Data Encryption Act application?

Reusable infrastructure belongs in the master engine. Federal legal meaning,
policy configuration, evidence vocabulary, statutory orchestration, and user
experience remain downstream.

## Final dependency boundary

The runtime dependency direction is:

~~~
Federal Encryption policy / workflows / UI
                  |
                  v
              @caiae/sdk
                  |
                  v
       Compliance Engine HTTP API
                  |
                  v
        reusable engine services
                  |
                  v
              PostgreSQL
~~~

Federal Encryption runtime code does not:

- connect directly to the engine database;
- import engine database, evidence, deadline, finding, certification,
  authorization, exception, rule, or reporting service packages;
- reconstruct generic lifecycle state machines;
- calculate generic engine effectiveness or certification validity;
- verify immutable audit chains independently;
- build raw engine HTTP routes through `client.request(...)`.

Architecture tests enforce those constraints.

## Reusable abstractions moved upstream

Development of the first thin app exposed several access-layer gaps where the
engine already owned the generic behavior but `@caiae/sdk` did not yet expose
it cleanly.

Those gaps were upstreamed rather than duplicated downstream.

### Authorization and exception lifecycle

The typed SDK exposes generic authorization, emergency authorization, exception,
approval, revocation, and effectiveness operations.

Federal Encryption retains only Section 7 semantics such as
technical-impracticability waivers, classified-system conflicts, narrow scope,
compensating controls, eligible authority, and emergency communications policy.

### Deadline lifecycle

The typed SDK exposes generic deadline creation, status, listing, satisfaction,
and cancellation.

Federal Encryption retains the statute-specific interpretation of:

- 180 days;
- one calendar year;
- 18 calendar months;
- three calendar months;
- OMB-selected annual dates;
- explicitly scheduled IG reviews.

The downstream application converts those legal calendar rules into exact
timestamps before passing them to the generic engine. The engine does not need
to know the statute.

### Findings, remediation, and certification

The typed SDK exposes the engine's generic finding, remediation, and positive
certification lifecycles.

Federal Encryption retains Section 6 reporting content, OMB corrective-action
meaning, contractor/external-system attestation, and the distinction between a
statutory filing and a positive operational certification.

### Evidence

The final SDK review adds typed evidence creation and lifecycle access.

Federal-specific evidence types and schemas remain downstream. The engine owns
storage, validity, supersession, attestation, revocation, and immutable audit
events.

### Reporting

The master engine remains authoritative for cross-lifecycle compliance reports
and CSV/text rendering.

The final SDK review exposes point-in-time and rendered reports through typed
methods, so the Federal web application no longer constructs report URLs.

Federal Encryption owns only the dashboard projection, terminology, layout, and
Section 6 filing presentation.

### Health

The public engine health endpoint is now exposed through the typed SDK instead
of being called as a raw route by the downstream web application.

## What correctly remains downstream

Some code can look generally useful while still encoding Federal-specific legal
meaning. The final review intentionally leaves the following downstream.

### Policy rules and schemas

The Federal policy bundle defines covered information, encryption-at-rest and
encryption-in-transit requirements, NIST alignment, contractor obligations,
external systems, and Federal-specific evidence vocabulary.

Those definitions are the application, not engine infrastructure.

### Calendar-period interpretation

The statutory clock package contains calendar-month and calendar-year helpers
because the source uses legal calendar periods rather than fixed second counts.

The engine receives exact timestamps and remains policy-neutral. Moving those
statutory calculations into the generic deadline engine would incorrectly teach
the engine one law's interpretation.

### Section 5 partner orchestration

Contractors, subcontractor flow-down, existing-agreement actions, cloud/shared
services, and provider-access concepts are Federal policy semantics.

The generic pieces they use—resources, evidence, evaluation, findings and
audit—remain upstream.

### Section 6 filing validation

The annual filing requires specific Federal report contents: compliance extent,
system counts and percentages, incidents, remedial actions, plans, milestones,
resource needs, and contractor/external-system attestation.

Those requirements stay downstream. Generic resource persistence, deadlines,
findings, remediation, certifications, and audit stay upstream.

### Filing identity and content hashes

PR 7 uses deterministic identifiers and a canonical content hash to make
statutory filing retries safe and prevent silent rewrites.

That behavior is part of this application's filing orchestration. It does not
create a new generic engine state machine, so no upstream abstraction is needed
unless multiple future applications demonstrate the same domain requirement.

### Dashboard projection and legal-mode banner

The Federal dashboard decides which generic report fields deserve attention,
how they are labeled, and how Section 6 filings are separated from positive
certifications.

The fail-closed Draft / simulation versus Enacted / live compliance banner is
also application-specific legal presentation.

## Raw-route audit

Before PR 9, three categories of raw SDK requests remained:

1. evidence submission in evaluation and partner workflows;
2. finding synchronization in the original evaluation workflow;
3. health and rendered-report requests in the web application.

The finding lifecycle was already typed upstream by the prior SDK abstraction.
The final upstream SDK completion covers evidence, rendered reports, and health.

PR 9 replaces the downstream calls with typed SDK methods.

The downstream architecture tests now fail if runtime code contains raw
`.request(...)` / `.request<T>(...)` use.

## Legal activation remains fail-closed

Nothing in this architecture review changes the legal-status rule.

The source legislation remains draft by default. Live statutory clocks,
accountability records, and UI legal mode require explicit enactment/effective
configuration and the appropriate authority/reference.

Software readiness is not treated as legal enactment.

## Future-change rule

For future Federal Encryption development:

1. If behavior is specific to the Federal Data Encryption Act, keep it here.
2. If behavior is a reusable compliance lifecycle or transport abstraction,
   implement it upstream first.
3. If reuse is plausible but not yet demonstrated, prefer a thin downstream
   composition over prematurely expanding the engine.
4. Downstream runtime must use typed `@caiae/sdk` methods, not engine internals
   or hand-built engine routes.
5. Any upstream pin change must pass the downstream repository's complete
   TypeScript, test, and production-build gate.

With those constraints in place, the Federal Encryption application is a
complete reference implementation of the master engine's thin-application
architecture.
