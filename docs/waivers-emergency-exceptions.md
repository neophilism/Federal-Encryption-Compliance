# Waivers and emergency exceptions

PR 5 implements the Section 7 operating workflow without turning an exception into an ordinary passing control.

The source legislation remains draft. These workflows therefore model the draft's governance requirements but do not assert that any waiver or emergency exception is legally effective outside a properly activated deployment.

## Technical-impracticability waiver

A waiver request must be tied to:

- one resource;
- one specific rule;
- a non-empty, specific scope;
- a written technical-impracticability explanation;
- a risk-assessment reference;
- at least one compensating control with a verification reference;
- a finite validity window no longer than one year;
- an approval authority and eligible approver set.

The downstream application deliberately rejects wildcard or "all" rule targets and scope values. This encodes the no-blanket-waiver requirement at the application boundary.

The engine remains responsible for the generic request, approval-quorum, denial, revocation, expiration, effectiveness, and tamper-evident audit lifecycle.

## Renewal

A renewal is a new waiver request.

The new request may record `renewalOfWaiverId` for traceability, but it must independently satisfy the same eligibility, scope, compensating-control, approver, and maximum-duration checks.

An existing waiver is never silently extended in place.

## Emergency communications

Emergency communications are not modeled as a pre-approved waiver.

They use the master engine's emergency-authorization abstraction:

1. the emergency authorization is immediately approved/effective;
2. it has a finite `validUntil`;
3. it has a mandatory `emergencyReviewDueAt`;
4. authorized reviewers subsequently approve or deny the emergency use;
5. if review becomes overdue, the engine reports it ineffective and its sweep lifecycle revokes the authorization;
6. ordinary controls resume when the emergency ends.

The downstream request also records the emergency description, communication purpose, and narrow incident/channel scope.

## Classified systems

A classified-system conflict is modeled as a narrow exception, not a blanket exclusion from the Act.

The request requires:

- a specific target rule;
- a specific classified-system/enclave scope;
- the controlling classified-directive reference;
- a description of the conflict;
- compensating controls;
- a finite validity window no longer than one year;
- designated approval authority.

This keeps the software from treating "classified" as a universal bypass flag.

## SDK boundary

PR 5 depends on master-engine PR 27, which exposes the already-existing generic exception and emergency-authorization lifecycles through typed `@caiae/sdk` methods.

The Federal Encryption runtime imports only `@caiae/sdk`. It does not import:

- `@caiae/exceptions`;
- `@caiae/authorization`;
- `@caiae/db`;
- `@caiae/rules`.

Policy meaning remains downstream; lifecycle machinery remains upstream.

## Ruleset semantics

PR 5 does not add "waiver passes" to the declarative Section 4/5 ruleset.

A control remains a control. A waiver or emergency authorization is a separate, auditable legal/operational state that a UI, report, or enforcement workflow can consult explicitly.

That separation avoids rewriting a failed technical fact as if the underlying encryption control had actually passed.
