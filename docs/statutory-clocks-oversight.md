# Statutory clocks and oversight

PR 6 implements the date and oversight workflow for the draft Federal Data Encryption Act without treating the draft as enacted law.

## Activation is fail-closed

The pure date helpers can calculate hypothetical dates for tests, demonstrations, or legislative analysis.

Persisted oversight deadlines are different. `FederalOversightManager` requires both:

- an explicit enactment timestamp; and
- a non-empty enactment authority/reference.

There is no default enactment date and no automatic conversion of the draft source into a live legal obligation.

## Enactment-based clocks

Once an enacted deployment is explicitly configured, the package provisions these obligations:

| Obligation | Authority | Clock |
| --- | --- | --- |
| NIST standards/guidance | Sec. 4(b) | 180 days after enactment |
| Agency implementation | Sec. 4(c) | one calendar year after enactment |
| Existing-contract transition outer limit | Sec. 5(a) | no later than one calendar year after enactment |
| GAO implementation evaluation | Sec. 6(c) | 18 calendar months after enactment |

The persisted deadline metadata records the source section, enactment timestamp, enactment reference, and calculation model.

No statutory grace period is invented. These clocks are created with a zero grace period.

## Calendar periods are not fixed-second shortcuts

The bill uses different units deliberately.

- 180 days is calculated as 180 UTC days.
- one year is calculated as 12 calendar months;
- 18 months is calculated as 18 calendar months;
- a quarterly update is calculated as three calendar months.

Calendar-month arithmetic preserves the UTC time of day and clamps an end-of-month date to the last valid day of the target month. For example, a February 29 one-year anniversary becomes February 28 in a non-leap target year, and a January 31 quarterly deadline becomes April 30.

This avoids silently equating a legal year with 365 days or a quarter with 90 days.

## Annual agency certification

Section 6(a) says the certification date is selected by OMB but may not be later than December 31 of each year.

The application therefore does not create a fixed 365-day recurrence. Each reporting year's certification is scheduled explicitly with:

- the agency resource;
- reporting year;
- the actual OMB-selected due date;
- the OMB directive/reference establishing that date.

The manager validates that the supplied due date is inside the stated reporting year and is not before enactment.

This also allows OMB to choose a different certification date in a later year without pretending the statute fixed one permanent anniversary date.

## Quarterly updates while noncompliant

When an agency cannot certify full compliance, Section 6(a) requires quarterly progress updates until full compliance is achieved.

Each update is scheduled as an explicit three-calendar-month clock from the prior certification or progress report. The package does not use a 90-day recurrence.

The caller supplies the noncompliance reference and sequence number. Once full compliance is achieved, the caller stops scheduling another quarterly update. The certification/remediation state that establishes full compliance belongs to PR 7.

## OMB corrective-action milestones

Section 6(b)(1) permits OMB to require a corrective action plan with defined milestones and deadlines.

PR 6 schedules those milestones using the exact due date from the OMB-approved plan. It does not invent milestone dates, budget restrictions, personnel sanctions, or other enforcement actions.

## Inspector General reviews

Section 6(d) requires FDEA compliance to be included in existing periodic audits or FISMA evaluations. It does not create a new standalone fixed interval.

Accordingly, the package schedules an IG review only when an actual review identifier, framework/reference, and due date are supplied. It does not manufacture an annual or quarterly IG clock.

## Idempotency and clock corrections

Before creating an obligation, the manager lists existing deadlines for the deterministic subject.

- If the same active obligation already exists with the same due date, it is reused.
- If more than one active copy exists, provisioning fails visibly.
- If an active obligation exists with a different due date, the manager rejects the silent change.

A changed legal or OMB date must therefore be corrected or superseded explicitly through an auditable workflow rather than overwritten by a second provisioning call.

## SDK boundary

PR 6 depends on master-engine PR 28, which exposes the existing generic deadline lifecycle through typed `@caiae/sdk` methods.

The Federal Encryption runtime imports only `@caiae/sdk`. It does not import the deadline service, database package, rules engine, or other engine internals.

Policy meaning and calendar interpretation remain downstream. Deadline persistence, status calculation, worker sweeps, occurrence history, and the tamper-evident lifecycle remain upstream.

## PR 7 boundary

PR 6 tracks when oversight actions are due and lets an authorized caller mark a deadline satisfied.

It does not yet create the substantive:

- finding;
- remediation case;
- agency-head certification;
- quarterly compliance report; or
- final compliance certification.

Those evidence-bearing artifacts belong to PR 7: findings, remediation, and certification. PR 7 can satisfy the clocks established here when the corresponding artifact is actually completed.
