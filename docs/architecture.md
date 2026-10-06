# Architecture

Federal Encryption Compliance is intentionally a thin downstream application.

## Dependency direction

~~~
Federal-specific UI/config/schemas
            |
            v
        @caiae/sdk
            |
            v
Compliance Engine HTTP API
            |
            v
Reusable upstream services
            |
            v
       PostgreSQL
~~~

The downstream app may define Federal Data Encryption Act concepts such as agencies, covered contractors, covered information, encryption requirements, NIST conformity, waivers, and statutory reporting. Those terms must not be added to the master engine unless a later abstraction is proven to be policy-neutral.

## Upstream pin

The master engine is mounted as vendor/caiae and pinned by Git to an exact upstream commit.

The root npm workspace includes vendor/caiae/packages/*, allowing the app to depend on @caiae/sdk before the SDK is published to a package registry. No upstream source is copied into this repository.

To update the pin after an upstream change:

~~~
git submodule update --remote vendor/caiae
git add vendor/caiae
~~~

The update must pass this repository's complete validation gate before merge.

## Data boundary

The application must not:

- connect to the compliance engine PostgreSQL database directly;
- import @caiae/db or engine domain-service packages from app code;
- duplicate rules/evaluation/audit behavior implemented upstream;
- expose operator or service credentials through public configuration.

The application should:

- use @caiae/sdk for engine API access;
- keep policy configuration and source citations downstream;
- upstream reusable abstractions discovered during implementation;
- pin upstream changes explicitly and test them here.

## PR 1 boundary

PR 1 establishes only the application shell, SDK/configuration boundary, runtime engine-health probe, and validation pipeline.

Detailed statutory rules, authority-source records, resource schemas, evidence schemas, waivers, clocks, certification workflows, and reporting are added in later PRs.
