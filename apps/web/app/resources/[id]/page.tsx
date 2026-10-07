import Link from "next/link";
import {
  ComplianceDashboard,
} from "../../../components/compliance-dashboard";
import {
  DemoBanner,
} from "../../../components/demo-banner";
import {
  loadFederalResourceDashboard,
} from "../../../lib/dashboard";
import {
  readFederalLegalStatus,
} from "../../../lib/legal-status";
import {
  isFederalDemoMode,
} from "../../../lib/demo-mode";

export const dynamic =
  "force-dynamic";

export default async function ResourcePage({
  params,
}: {
  params:
    Promise<{
      id: string;
    }>;
}) {
  const { id } =
    await params;
  const dashboard =
    await loadFederalResourceDashboard(
      id,
    );
  const legalStatus =
    readFederalLegalStatus();
  const demoMode =
    isFederalDemoMode();

  return (
    <main className="shell">
      <nav className="back-nav">
        <Link href="/">
          ← Organization dashboard
        </Link>
      </nav>

      {demoMode && <DemoBanner />}

      {dashboard.state ===
      "ready" ? (
        <ComplianceDashboard
          data={
            dashboard.data
          }
          legalStatus={
            legalStatus
          }
          resourceId={id}
        />
      ) : (
        <section className="setup-shell">
          <p className="eyebrow">
            Resource report
          </p>
          <h1>
            Unable to load resource
          </h1>
          <p className="lede">
            {dashboard.state ===
            "error"
              ? dashboard.message
              : "Operator access is not fully configured."}
          </p>
        </section>
      )}
    </main>
  );
}
