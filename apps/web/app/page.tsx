import {
  ComplianceDashboard,
} from "../components/compliance-dashboard";
import {
  EngineStatus,
} from "../components/engine-status";
import {
  loadFederalDashboard,
} from "../lib/dashboard";
import {
  readFederalLegalStatus,
} from "../lib/legal-status";
import {
  readOperatorReadiness,
} from "../lib/operator";

export const dynamic =
  "force-dynamic";

export default async function HomePage() {
  const [
    dashboard,
    legalStatus,
  ] = await Promise.all([
    loadFederalDashboard(),
    Promise.resolve(
      readFederalLegalStatus(),
    ),
  ]);
  const readiness =
    readOperatorReadiness();

  return (
    <main className="shell">
      <header className="masthead">
        <div>
          <span className="seal">
            FEC
          </span>
          <div>
            <strong>
              Federal Encryption Compliance
            </strong>
            <span>
              Compliance · Oversight · Audit
            </span>
          </div>
        </div>
        <EngineStatus />
      </header>

      {dashboard.state ===
      "ready" ? (
        <ComplianceDashboard
          data={
            dashboard.data
          }
          legalStatus={
            legalStatus
          }
        />
      ) : (
        <section className="setup-shell">
          <p className="eyebrow">
            Operator dashboard
          </p>
          <h1>
            Federal Encryption Compliance
          </h1>
          <p className="lede">
            The application shell is running, but the operator dashboard is not yet connected to a complete engine organization context.
          </p>

          <article
            className={
              "setup-card " +
              dashboard.state
            }
          >
            <h2>
              {dashboard.state ===
              "unconfigured"
                ? "Complete server-side configuration"
                : "Dashboard data is unavailable"}
            </h2>
            {dashboard.state ===
            "unconfigured" ? (
              <>
                <p>
                  Configure the following server-side environment values. They are never returned through public configuration endpoints.
                </p>
                <ul>
                  {dashboard.missing.map(
                    (name) => (
                      <li
                        key={
                          name
                        }
                      >
                        <code>
                          {name}
                        </code>
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : (
              <p>
                {dashboard.message}
              </p>
            )}
          </article>

          <section className="setup-details">
            <div>
              <span>
                Engine endpoint
              </span>
              <strong>
                {readiness.engineBaseUrl}
              </strong>
            </div>
            <div>
              <span>
                Organization
              </span>
              <strong>
                {readiness.organizationId ??
                  "Not configured"}
              </strong>
            </div>
            <div>
              <span>
                Legal mode
              </span>
              <strong>
                {legalStatus.label}
              </strong>
            </div>
          </section>
        </section>
      )}
    </main>
  );
}
