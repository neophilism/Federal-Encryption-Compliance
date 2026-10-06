# Contractor and external-system compliance

PR 4 implements the Section 5 downstream operating model for contractors, subcontractors, cloud services, shared services, and other external systems.

The source legislation remains draft. All evaluation behavior therefore retains PR 3's explicit distinction between draft simulation and registered/effective evaluation.

## Policy version

PR 4 advances the declarative bundle to:

~~~
2025-draft-2
~~~

The version supersedes the prior draft-1 configuration rather than silently mutating it.

## Covered contractors

A covered-contractor resource records policy-specific facts including:

- sponsoring agency;
- contract, grant, cooperative agreement, or other arrangement;
- whether the instrument is new after enactment or existed at enactment;
- whether Section 4 controls are implemented;
- whether compliance is a material condition of the agreement;
- whether an existing agreement was modified or received written compliance notice;
- whether subcontractor requirements flow down through all tiers;
- whether encryption compliance is incorporated into periodic contractor evaluation;
- latest evaluation/audit state.

These remain downstream resource attributes. The master engine treats them as generic resource data.

## Existing agreements

For an agreement marked existing-at-enactment, the ruleset requires an explicit compliance mandate action.

The evidence contract supports:

- agreement modification; or
- written compliance notice.

The statutory maximum compliance clock for existing instruments is intentionally deferred to PR 6, where all enactment-anchored clocks will be implemented together through the reusable deadline engine.

## Subcontractor flow-down

The downstream model records both:

- whether flow-down was implemented; and
- whether all tiers handling covered information are covered.

A prime contractor with subcontractors cannot satisfy the modeled flow-down control through a partial first-tier clause.

## Periodic contractor evaluation

The contractor operating workflow can record an evaluation performed by:

- a contracting officer;
- a contracting officer's delegee;
- an agency security official; or
- an authorized third-party assessor.

The evidence can record:

- whether Section 4 controls were verified;
- whether significant failure was found;
- a material-breach determination;
- an assessment reference;
- an enforcement disposition.

The software records these facts. It does not autonomously terminate a contract, suspend a contractor, debar an entity, or impose a penalty. Those are external legal/administrative actions.

## Cloud and external systems

Every covered external service is modeled for:

- Section 4 control implementation; and
- a contract, memorandum of understanding, or other agreement requiring compliance.

Cloud services additionally require:

- covered Federal data to be encrypted; and
- key management that prevents unauthorized provider or third-party access.

Cloud-only controls are not applied to a non-cloud shared service.

## Operational API workflow

The partner package uses only downstream policy vocabulary plus the upstream SDK:

~~~
partner workflow
  -> @caiae/sdk
  -> generic resource/evidence/check APIs
  -> master engine
~~~

Supported operations include:

- create contractor;
- create external service;
- record contract compliance clause;
- record all-tier subcontractor flow-down;
- record existing-agreement compliance action;
- record periodic contractor evaluation;
- record external-service agreement;
- record external-service encryption assessment;
- evaluate a partner through the upstream engine.

## Generic upstream abstraction discovered

PR 4 exposed a reusable master-engine gap: resources could previously be created and read but not updated.

That capability was implemented upstream in master-engine PR 26 as:

- PATCH /v1/resources/:id;
- SDK getResource() / updateResource();
- optimistic concurrency using expectedUpdatedAt;
- same-transaction tamper-evident resource.updated events;
- before/after audit snapshots.

This downstream branch pins the exact green upstream PR 26 commit.

## Update/evidence failure semantics

A partner workflow generally:

1. reads the current resource;
2. updates policy-specific current state using optimistic concurrency;
3. creates the corresponding evidence record.

Resource mutation and evidence creation are separate HTTP operations. If step 3 fails after the resource update, the declarative rule still requires the evidence type. A subsequent evaluation therefore cannot pass solely from the updated attribute; it becomes unknown because required evidence is absent.

This fail-closed behavior preserves the distinction between asserted current state and supporting evidence.

## Representative fixtures

PR 4 includes:

- compliant covered contractor — 5 applicable controls pass;
- failing covered contractor — 5 applicable controls fail;
- compliant cloud service — 4 applicable controls pass;
- failing cloud service — 4 applicable controls fail;
- compliant shared service — only the 2 general external-service controls apply.

Run a fixture in draft simulation mode:

~~~
FDEA_PARTNER_FIXTURE=compliant-covered-contractor
npm run partners:fixture
~~~

Registered/effective mode uses the same PR 3 environment variables.
