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
