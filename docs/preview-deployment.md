# Preview deployment

The Federal Encryption application has a reproducible Render preview definition at the repository root in `render.yaml`.

## Purpose

The preview is for rapid visual and workflow inspection during development. It is not a production deployment and must not contain real agency data or credentials.

The default preview is intentionally configured for fictional demo data:

```
FDEA_DEMO_MODE=true
```

Demo mode remains legally fail-closed: it does not set `FDEA_EFFECTIVE_FROM` or `FDEA_ENACTMENT_REFERENCE`, so the interface continues to identify the Federal Data Encryption Act source as **Draft / simulation**.

## Render service

The Blueprint defines:

- a Node 24 web service;
- Virginia region;
- the repository root as the build context;
- `npm install && npm run build`;
- the supported Next.js `next start` runtime;
- deploy-after-checks behavior;
- `/api/config` as the lightweight health check;
- automatic preview-environment generation for pull requests when the Blueprint is connected in Render.

No secrets are committed to the Blueprint.

## Production-style engine mode

To connect the UI to a real Compliance, Authorization & Immutable Audit Engine deployment instead of fictional demo data, disable demo mode and configure these server-side values:

```
FDEA_DEMO_MODE=false
CAIAE_API_BASE_URL=https://...
CAIAE_ORGANIZATION_ID=...
CAIAE_OPERATOR_TOKEN=...
```

The operator token must remain server-side.

Live legal mode additionally requires both:

```
FDEA_EFFECTIVE_FROM=...
FDEA_ENACTMENT_REFERENCE=...
```

Do not set those values merely to make a demo look enacted.

## Smoke test

After a deploy:

```
PREVIEW_BASE_URL=https://federal-encryption-preview.onrender.com npm run preview:smoke
```

The smoke test verifies the public application shell and public configuration endpoint. The full demo-mode smoke gate is extended in PR 12 to cover dashboard, health, report export, and resource drill-down routes.
