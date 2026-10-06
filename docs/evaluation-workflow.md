# Encryption compliance evaluation

PR 3 makes the PR 2 policy bundle executable through the upstream compliance engine without copying the rules engine into this repository.

## Evaluation modes

### Draft simulation

The source legislation remains draft. The default workflow is simulation.

Simulation sends the downstream declarative ruleset to the engine as an ad-hoc ruleset:

~~~
FDEA_EVALUATION_MODE=simulation
npm run evaluation:fixture
~~~

The resulting check is an engine audit artifact, but downstream metadata explicitly labels the legal status as draft-simulation.

Simulation is useful for:

- testing policy configuration;
- demonstrating expected controls;
- validating evidence collection;
- identifying schema and rule mistakes before enactment.

It must not be presented as a certification that currently effective law requires the controls.

### Registered effective ruleset

After enactment and explicit activation of the registered ruleset, evaluation can use:

~~~
FDEA_EVALUATION_MODE=registered
FDEA_REGISTERED_RULESET_ID=<registered ruleset UUID>
npm run evaluation:fixture
~~~

Registered mode sends only the registered ruleset ID. The engine resolves the stored immutable definition and legal/source traceability.

## Workflow

The fixture/evaluation client performs:

1. create a Federal-specific resource through @caiae/sdk;
2. submit typed evidence records through the engine API;
3. call the upstream compliance evaluation engine;
4. parse the returned engine evaluation into a narrow downstream summary;
5. optionally synchronize failed rules into the engine finding lifecycle.

No downstream product code reimplements rule predicates, evidence-state calculation, immutable checks, or findings.

## Representative fixtures

PR 3 includes:

- fully-compliant-system — all eight applicable information-system controls pass;
- failing-system — all eight applicable controls fail with evidence present;
- incomplete-evidence-system — claimed controls are present but evidence is absent, producing unknown results;
- non-covered-system — modeled controls are not applicable because the resource does not handle covered information.

Contract tests execute these fixtures with the exact upstream @caiae/rules evaluator as a test-only dependency. Product/runtime code continues to depend on the engine through @caiae/sdk only.

## Findings

Finding synchronization is opt-in:

~~~
FDEA_SYNC_FINDINGS=true
~~~

This preserves a useful distinction:

- policy simulation can run without creating remediation work;
- a deliberate operational evaluation can synchronize failed rules into the engine finding/remediation lifecycle.

PR 7 will build the Federal-specific findings/remediation user workflows on top of those generic upstream objects.

## CLI environment

Required:

~~~
CAIAE_API_BASE_URL=https://engine.example.gov
CAIAE_ORGANIZATION_ID=<organization UUID>
CAIAE_OPERATOR_TOKEN=caiau_...
~~~

Optional:

~~~
FDEA_FIXTURE=fully-compliant-system
FDEA_EVALUATION_MODE=simulation
FDEA_REGISTERED_RULESET_ID=<UUID>
FDEA_EVALUATED_AT=<ISO timestamp>
FDEA_SYNC_FINDINGS=false
CAIAE_PRINCIPAL_ID=<principal UUID>
~~~

Run:

~~~
npm run evaluation:fixture
~~~
