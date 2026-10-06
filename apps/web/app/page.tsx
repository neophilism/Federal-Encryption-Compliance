import {
  EngineStatus,
} from "../components/engine-status";
import {
  buildThinAppConfig,
} from "../lib/config";

export default function HomePage() {
  const config =
    buildThinAppConfig();

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">
          Thin application · Compliance, Authorization &amp; Immutable Audit Engine
        </p>
        <h1>
          Federal Encryption Compliance
        </h1>
        <p className="lede">
          A policy-specific application for administering encryption obligations,
          evidence, exceptions, findings, remediation, certification, and reporting
          through the reusable upstream compliance engine.
        </p>
      </header>

      <EngineStatus />

      <section
        className="grid"
        aria-label="Application architecture"
      >
        <article className="card">
          <h2>
            Downstream policy
          </h2>
          <p>
            Federal Data Encryption Act schemas, rules, source citations, terminology,
            and user experience live in this repository.
          </p>
        </article>

        <article className="card">
          <h2>
            Upstream engine
          </h2>
          <p>
            Rules, authorizations, evidence, deadlines, findings, certification,
            publication, audit, security, and reporting remain reusable upstream.
          </p>
        </article>

        <article className="card">
          <h2>
            SDK boundary
          </h2>
          <p>
            This app talks to the engine through <code>@caiae/sdk</code> and HTTP.
            It has no direct PostgreSQL or engine-service dependency.
          </p>
        </article>
      </section>

      <section className="details">
        <div>
          <span>App ID</span>
          <strong>{config.appId}</strong>
        </div>
        <div>
          <span>Engine endpoint</span>
          <strong>{config.engine.apiBaseUrl}</strong>
        </div>
        <div>
          <span>Organization</span>
          <strong>
            {config.engine.organizationId ??
              "Not provisioned yet"}
          </strong>
        </div>
      </section>
    </main>
  );
}
