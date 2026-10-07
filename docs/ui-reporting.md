# Federal Encryption UI and reporting

PR 8 turns the initial Next.js connectivity shell into an operator-facing
compliance and oversight application.

## Security boundary

The browser never receives the engine operator credential.

Server-side web code reads:

- `CAIAE_API_BASE_URL`
- `CAIAE_ORGANIZATION_ID`
- `CAIAE_OPERATOR_TOKEN`

and creates an operator client through `@caiae/sdk`.

Public configuration continues to expose only the safe thin-app configuration.
The dashboard API returns a derived compliance projection, not credentials.

The architecture regression test scans web runtime source and rejects imports of
engine service/database packages. Client components are additionally prohibited
from referencing `CAIAE_OPERATOR_TOKEN` or constructing an operator client.

## Fail-closed legal mode

The interface distinguishes software configuration from legal status.

The dashboard reports **Draft / simulation** by default. It enters
**Enacted / live compliance** mode only when both of the following are present:

- a valid `FDEA_EFFECTIVE_FROM` date-time;
- a non-empty `FDEA_ENACTMENT_REFERENCE`.

Supplying only one value, or an invalid timestamp, produces an
**Enactment configuration incomplete** state. The UI therefore does not infer
that the draft source is enacted merely because compliance data exists.

## Dashboard data source

The dashboard uses the upstream compliance report as its authoritative
cross-lifecycle read model.

The reusable report already includes:

- resources;
- checks;
- exceptions;
- deadlines and effective clock state;
- findings;
- remediation;
- certifications and effective status;
- audit chains and audit events.

PR 8 projects those generic records into Federal terminology and attention
queues. It does not reproduce rules evaluation, deadline calculation,
certification validity, exception effectiveness, finding transitions, or audit
verification.

## Organization dashboard

The organization dashboard displays:

- total resources;
- failed checks;
- overdue deadlines;
- unresolved findings;
- active remediation;
- valid certifications;
- active exceptions;
- invalid audit-chain count.

Operational panels show the nearest active clocks, unresolved findings,
remediation work, certifications, and per-resource posture.

The resource inventory links to resource-level reports.

## Resource reports

`/resources/<resource-id>` requests the upstream resource-scoped compliance
report and presents the same lifecycle views for a single system, contractor,
external service, agency, or other resource.

Resource identifiers are encoded before use in engine report paths.

## Section 6 filing view

PR 7 deliberately separates statutory filings from positive engine
certifications. PR 8 preserves that distinction in the interface.

The dashboard lists:

- Section 6 annual certification filings;
- quarterly noncompliance progress updates;
- filing timestamp;
- reporting year or quarterly sequence;
- whether the filing reports full compliance or continuing remediation.

Those filings are read from the auditable resource records created by PR 7.

## Report export

The server route `/api/reports/compliance` proxies the existing master-engine
report renderer through the SDK transport.

Supported formats:

- JSON;
- CSV;
- text.

The route supports optional resource scoping and `asOf` reporting and sets
download-safe filenames. Unsupported formats are rejected before an engine
request is made.

No parallel report generator is implemented downstream.

## Unconfigured deployments

A deployment can build and start before an engine organization/operator
credential is provisioned.

In that state the UI presents a configuration screen identifying missing
server-side values rather than crashing or exposing secrets.

## Audit integrity

The dashboard surfaces the upstream report's audit-chain verification result.
It does not independently recalculate the hash chain in the browser or
downstream application.

Any invalid chain is shown as an operationally critical dashboard condition.
