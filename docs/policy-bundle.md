# Federal Data Encryption policy bundle

PR 2 converts the Federal Data Encryption Act source package into downstream policy data for the reusable compliance engine.

## Legal/source status

The source document is a draft titled **Federal Data Encryption Act of 2025** and contains a drafting note that sponsor names and a bill number remain to be inserted.

For that reason:

- the policy is created as **draft**;
- the registered ruleset version is **2025-draft-1**;
- no effective date is assumed;
- provisioning does not activate the ruleset unless FDEA_EFFECTIVE_FROM is supplied explicitly.

This prevents the application from representing draft legislation as currently effective law.

## Authority manifest

The registered ruleset carries section-level source references for:

- Section 3 — definitions and scope vocabulary;
- Section 4 — encryption in transit and at rest, integrity/authentication, NIST standards, key management, and implementation;
- Section 5 — contractors, subcontractors, cloud/shared services, and other external systems;
- Section 6 — oversight, annual certification, remediation reporting, and accountability;
- Section 7 — waivers and exceptions;
- Section 11 — effective date.

Each declarative rule also records its more precise section locator in metadata.

## Resource schemas

The downstream app defines four policy-specific resource vocabularies:

- federal-agency;
- information-system;
- covered-contractor;
- external-service.

These remain downstream concepts. The master compliance engine continues to see generic resources and attributes.

The schemas use JSON Schema 2020-12-shaped documents with additionalProperties set to false so downstream ingestion has an explicit contract.

## Evidence schemas

PR 2 defines evidence contracts for:

- transit-encryption configuration;
- at-rest encryption configuration;
- integrity/authentication controls;
- NIST cryptographic conformance;
- key management;
- contractor compliance assessment;
- contract compliance clauses;
- subcontractor flow-down;
- external-service assessment;
- external-service agreement.

Every evidence type required by the declarative ruleset has a corresponding schema.

## Ruleset

The initial ruleset contains 12 declarative controls covering:

- covered-information encryption in transit;
- encryption at rest;
- portable storage encryption when applicable;
- integrity/authenticity controls;
- NIST conformance;
- key management;
- contractor Section 4 compliance;
- contractor compliance clauses;
- subcontractor flow-down;
- external-service Section 4 compliance;
- external-service compliance agreements;
- external-service key isolation.

PR 3 will build evaluation workflows and representative fixtures around this ruleset. PR 4 expands the contractor/external-system operational workflows. PR 5 handles waiver and emergency-exception workflows through the engine's exception model rather than pretending those are ordinary passing controls.

## Provisioning

Required environment:

~~~
CAIAE_API_BASE_URL=https://engine.example.gov
CAIAE_ORGANIZATION_ID=<organization UUID>
CAIAE_OPERATOR_TOKEN=caiau_...
~~~

Then run:

~~~
npm run policy:provision
~~~

On the first run, the script creates the draft policy and registers the draft ruleset.

If a policy record already exists, supply:

~~~
FDEA_POLICY_ID=<policy UUID>
~~~

To activate after enactment, explicitly supply the actual effective timestamp:

~~~
FDEA_EFFECTIVE_FROM=2027-01-15T12:00:00.000Z
npm run policy:provision
~~~

The provisioning script uses only @caiae/sdk and the engine HTTP API. It has no database access.
