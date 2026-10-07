# Findings, remediation, and certification

PR 7 implements the Federal Data Encryption Act accountability workflow on top
of the master engine's generic findings, remediation, certification, resource,
and deadline lifecycles.

## Boundary

Runtime code imports the reusable engine only through `@caiae/sdk`. Federal
statutory interpretation remains downstream.

The master engine owns:

- finding state transitions and immutable audit events;
- remediation state transitions and optional generic remediation deadlines;
- positive certification issuance, renewal, suspension, reinstatement, and
  revocation;
- generic resources used to preserve statutory filing artifacts;
- generic deadline persistence and satisfaction.

The Federal application owns:

- Section 6 report contents and validation;
- the distinction between a statutory filing and a positive compliance
  certificate;
- Federal metadata and authority references;
- the relationship between remediation work and Section 6 oversight clocks.

## Findings

A failed Federal encryption check can be synchronized into the engine's finding
lifecycle. PR 7 exposes Federal application methods for retrieval, assignment,
acknowledgement, dispute, dispute resolution, remediation, closure, and
reopening without duplicating the engine's state machine.

## Remediation

Agency remediation plans may use the generic remediation deadline lifecycle when
the agency supplies a due date.

OMB corrective-action-plan milestones are different. PR 6 already persists the
OMB-approved milestone as a statutory oversight deadline. PR 7 therefore links
the remediation to that deadline in metadata instead of creating a second clock.
The oversight deadline can be satisfied only after the linked remediation is in
the engine's verified state.

This keeps one authoritative due date for an OMB milestone.

## Section 6 annual filing

The annual filing contains structured, validated data for:

- the extent of agency compliance;
- the number and percentage of covered systems meeting the modeled compliance,
  encryption-in-transit, and encryption-at-rest requirements;
- identification of covered systems that are failed, unknown, or otherwise not
  fully passing;
- known encryption incidents in the supplied reporting period and the remedial
  actions taken for each incident;
- remediation plans, milestones, expected completion dates, and resource needs;
- the agency-head contractor/external-system attestation and supporting
  references;
- an explanation of inability to certify full compliance when applicable.

Counts and percentages are derived from the supplied system snapshots rather
than trusted as caller-entered totals.

If full compliance cannot be reported, both an explanation and at least one
remediation plan are required. If full compliance is reported, a contradictory
inability explanation is rejected.

## Filing is not positive certification

A Section 6 annual filing is a statutory submission. It may accurately report
that the agency is not yet fully compliant.

The master engine's generic certification object is intentionally stronger: it
requires a passed supporting check. PR 7 therefore does **not** issue a positive
engine certification merely because an agency submitted its annual report.

Instead:

- the annual or quarterly statutory submission is persisted as an auditable
  resource;
- a noncompliant annual submission schedules the first quarterly update;
- a noncompliant quarterly update schedules the next three-calendar-month
  update;
- once a quarterly filing reports full compliance, no next quarterly clock is
  created.

Positive `fdea.system-compliance` certifications are separate operational
artifacts for systems with passed supporting checks. PR 7 configures every
unresolved finding severity as blocking so an unresolved finding cannot coexist
with a new positive system certificate.

The validity window for these operational certificates is supplied explicitly
by the caller. PR 7 does not invent a statutory certificate lifetime.

## Filing integrity and retries

Annual filings use the deterministic reference:

`fdea:s6:annual:<agency-resource-id>:<reporting-year>`

Quarterly filings use a deterministic agency/root-noncompliance/sequence
reference.

The normalized filing content is canonically serialized and SHA-256 hashed. On
retry:

- an existing filing with the same reference and content hash is reused;
- an existing filing with the same reference but different content is rejected.

A changed statutory filing must therefore be handled as an explicit amendment
workflow rather than a silent overwrite.

## Clock completion

PR 7 checks an oversight deadline before satisfying it:

- an already-satisfied clock is a no-op, which makes retries safe;
- a cancelled clock cannot be satisfied;
- otherwise the completion is delegated to PR 6's oversight manager.

The annual clock is satisfied after the filing is safely persisted and any
required quarterly follow-up is scheduled. An OMB corrective-action milestone
is satisfied only after the linked remediation has been verified.

## Fail-closed legal activation

Like PR 6, the accountability manager requires both:

- a confirmed enactment timestamp; and
- a non-empty enactment authority/reference.

Federal filing and certification metadata records those values and marks the
source status as enacted. The draft source therefore cannot create live legal
accountability records by default.

## Penalties

The draft legislation describes consequences for knowingly false
certifications. PR 7 does not automate personnel, budgetary, disciplinary, or
other punitive actions. It preserves structured filings, checks, findings,
remediation history, certifications, clocks, and audit evidence so an authorized
human or later policy layer can apply the legally appropriate process.
