import {
  loadFederalDashboard,
} from "../../../lib/dashboard";
import {
  readFederalLegalStatus,
} from "../../../lib/legal-status";

export const dynamic =
  "force-dynamic";

export async function GET() {
  const dashboard =
    await loadFederalDashboard();
  const legalStatus =
    readFederalLegalStatus();

  if (
    dashboard.state ===
      "unconfigured"
  ) {
    return Response.json(
      {
        error:
          "operator_not_configured",
        missing:
          dashboard.missing,
        legalStatus,
      },
      {
        status: 503,
      },
    );
  }

  if (
    dashboard.state ===
      "error"
  ) {
    return Response.json(
      {
        error:
          "dashboard_unavailable",
        message:
          dashboard.message,
        legalStatus,
      },
      {
        status: 502,
      },
    );
  }

  return Response.json(
    {
      dashboard:
        dashboard.data,
      legalStatus,
    },
    {
      headers: {
        "cache-control":
          "no-store",
      },
    },
  );
}
