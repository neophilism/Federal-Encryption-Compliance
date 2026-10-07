import type {
  FederalDashboardData,
} from "./dashboard";

export const FEDERAL_DEMO_RESOURCE_IDS = {
  gateway: "demo-agency-gateway",
  legacy: "demo-legacy-records",
  cloud: "demo-contractor-cloud",
  shared: "demo-shared-service",
  archive: "demo-public-archive",
} as const;

const exceptionResourceIds =
  new Set<string>([
    FEDERAL_DEMO_RESOURCE_IDS.cloud,
  ]);

function isoOffset(
  days: number,
): string {
  const date = new Date();
  date.setUTCDate(
    date.getUTCDate() + days,
  );
  return date.toISOString();
}

function baseDemoData(): FederalDashboardData {
  const resources = [
    {
      id: FEDERAL_DEMO_RESOURCE_IDS.gateway,
      resourceType:
        "information-system",
      name:
        "Agency Secure Gateway",
      status: "active",
      latestCheckStatus:
        "passed",
      unresolvedFindings: 0,
      overdueDeadlines: 0,
      validCertifications: 1,
    },
    {
      id: FEDERAL_DEMO_RESOURCE_IDS.legacy,
      resourceType:
        "information-system",
      name:
        "Legacy Records Platform",
      status: "active",
      latestCheckStatus:
        "failed",
      unresolvedFindings: 2,
      overdueDeadlines: 1,
      validCertifications: 0,
    },
    {
      id: FEDERAL_DEMO_RESOURCE_IDS.cloud,
      resourceType:
        "external-service",
      name:
        "Contractor Cloud Analytics",
      status: "active",
      latestCheckStatus:
        "failed",
      unresolvedFindings: 1,
      overdueDeadlines: 0,
      validCertifications: 0,
    },
    {
      id: FEDERAL_DEMO_RESOURCE_IDS.shared,
      resourceType:
        "external-service",
      name:
        "Interagency Shared Service",
      status: "active",
      latestCheckStatus:
        "passed",
      unresolvedFindings: 0,
      overdueDeadlines: 0,
      validCertifications: 1,
    },
    {
      id: FEDERAL_DEMO_RESOURCE_IDS.archive,
      resourceType:
        "information-system",
      name:
        "Public Records Archive",
      status: "active",
      latestCheckStatus:
        "passed",
      unresolvedFindings: 0,
      overdueDeadlines: 0,
      validCertifications: 0,
    },
  ];

  const deadlines = [
    {
      id: "demo-deadline-overdue",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.legacy,
      subjectType:
        "information-system",
      subjectId:
        FEDERAL_DEMO_RESOURCE_IDS.legacy,
      deadlineType:
        "fdea.agency-implementation",
      effectiveStatus:
        "overdue",
      dueAt: isoOffset(-14),
    },
    {
      id: "demo-deadline-contract",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.cloud,
      subjectType:
        "external-service",
      subjectId:
        FEDERAL_DEMO_RESOURCE_IDS.cloud,
      deadlineType:
        "fdea.contract-transition",
      effectiveStatus: "due",
      dueAt: isoOffset(21),
    },
    {
      id: "demo-deadline-certification",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.shared,
      subjectType:
        "organization",
      subjectId:
        "demo-federal-agency",
      deadlineType:
        "fdea.annual-certification",
      effectiveStatus: "due",
      dueAt: isoOffset(60),
    },
    {
      id: "demo-deadline-gao",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.gateway,
      subjectType:
        "organization",
      subjectId:
        "demo-federal-agency",
      deadlineType:
        "fdea.gao-evaluation",
      effectiveStatus: "due",
      dueAt: isoOffset(120),
    },
  ];

  const findings = [
    {
      id: "demo-finding-at-rest",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.legacy,
      severity: "critical",
      status: "acknowledged",
      title:
        "Encryption at rest is incomplete",
      description:
        "A legacy storage tier contains covered information without the simulated Section 4 encryption-at-rest control.",
      openedAt: isoOffset(-22),
    },
    {
      id: "demo-finding-key-rotation",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.legacy,
      severity: "high",
      status: "open",
      title:
        "Key-rotation evidence is stale",
      description:
        "The most recent fictional key-management evidence falls outside the demonstration review window.",
      openedAt: isoOffset(-8),
    },
    {
      id: "demo-finding-provider-access",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.cloud,
      severity: "high",
      status: "open",
      title:
        "Cloud provider key access requires remediation",
      description:
        "The fictional contractor environment does not yet demonstrate controls preventing unauthorized provider access to encryption keys.",
      openedAt: isoOffset(-5),
    },
  ];

  const remediations = [
    {
      id: "demo-remediation-legacy",
      findingId:
        "demo-finding-at-rest",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.legacy,
      status: "in_progress",
      plan:
        "Migrate the remaining records volume to the approved encrypted storage tier and re-run evidence validation.",
      dueAt: isoOffset(30),
    },
    {
      id: "demo-remediation-cloud",
      findingId:
        "demo-finding-provider-access",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.cloud,
      status: "planned",
      plan:
        "Move tenant keys to agency-controlled key custody and complete an independent contractor control assessment.",
      dueAt: isoOffset(45),
    },
  ];

  const certifications = [
    {
      id: "demo-cert-gateway",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.gateway,
      certificationType:
        "fdea.system-compliance",
      certificateNumber:
        "DEMO-FDEA-001",
      effectiveStatus: "active",
      valid: true,
      validUntil: isoOffset(180),
    },
    {
      id: "demo-cert-shared",
      resourceId:
        FEDERAL_DEMO_RESOURCE_IDS.shared,
      certificationType:
        "fdea.system-compliance",
      certificateNumber:
        "DEMO-FDEA-002",
      effectiveStatus: "active",
      valid: true,
      validUntil: isoOffset(120),
    },
  ];

  return {
    generatedAt:
      new Date().toISOString(),
    asOf: new Date().toISOString(),
    organization: {
      id: "demo-federal-agency",
      name:
        "Example Federal Agency",
      slug:
        "example-federal-agency",
      status: "active",
    },
    metrics: [
      {
        label: "Resources",
        value: resources.length,
        tone: "neutral",
      },
      {
        label: "Failed checks",
        value: 2,
        tone: "critical",
      },
      {
        label:
          "Overdue deadlines",
        value: 1,
        tone: "critical",
      },
      {
        label: "Open findings",
        value: findings.length,
        tone: "critical",
      },
      {
        label:
          "Active remediation",
        value:
          remediations.length,
        tone: "warning",
      },
      {
        label:
          "Valid certifications",
        value:
          certifications.length,
        tone: "neutral",
      },
      {
        label:
          "Active exceptions",
        value: 1,
        tone: "warning",
      },
      {
        label:
          "Invalid audit chains",
        value: 0,
        tone: "good",
      },
    ],
    resources,
    deadlines,
    findings,
    remediations,
    certifications,
    filings: [
      {
        id:
          "demo-filing-annual-2026",
        resourceType:
          "fdea-annual-certification-filing",
        name:
          "2026 annual certification filing",
        externalRef:
          "demo:annual:2026",
        reportType:
          "annual-certification",
        agencyResourceId:
          "demo-federal-agency",
        reportingYear: 2026,
        sequence: null,
        submittedAt:
          isoOffset(-40),
        fullCompliance: false,
      },
      {
        id:
          "demo-filing-quarterly-1",
        resourceType:
          "fdea-quarterly-progress-update",
        name:
          "Quarterly progress update 1",
        externalRef:
          "demo:quarterly:2026:1",
        reportType:
          "quarterly-progress",
        agencyResourceId:
          "demo-federal-agency",
        reportingYear: 2026,
        sequence: 1,
        submittedAt:
          isoOffset(-18),
        fullCompliance: false,
      },
      {
        id:
          "demo-filing-quarterly-2",
        resourceType:
          "fdea-quarterly-progress-update",
        name:
          "Quarterly progress update 2",
        externalRef:
          "demo:quarterly:2026:2",
        reportType:
          "quarterly-progress",
        agencyResourceId:
          "demo-federal-agency",
        reportingYear: 2026,
        sequence: 2,
        submittedAt:
          isoOffset(-2),
        fullCompliance: false,
      },
    ],
    audit: {
      chainCount: 9,
      invalidChainCount: 0,
      allChainsValid: true,
    },
  };
}

export function buildFederalDemoDashboard(
  resourceId?: string,
): FederalDashboardData | null {
  const data = baseDemoData();

  if (!resourceId) {
    return data;
  }

  const resource =
    data.resources.find(
      (item) =>
        item.id === resourceId,
    );

  if (!resource) {
    return null;
  }

  const deadlines =
    data.deadlines.filter(
      (item) =>
        item.resourceId ===
        resourceId,
    );
  const findings =
    data.findings.filter(
      (item) =>
        item.resourceId ===
        resourceId,
    );
  const remediations =
    data.remediations.filter(
      (item) =>
        item.resourceId ===
        resourceId,
    );
  const certifications =
    data.certifications.filter(
      (item) =>
        item.resourceId ===
        resourceId,
    );

  return {
    ...data,
    metrics: [
      {
        label: "Resources",
        value: 1,
        tone: "neutral",
      },
      {
        label: "Failed checks",
        value:
          resource
            .latestCheckStatus ===
          "failed"
            ? 1
            : 0,
        tone:
          resource
            .latestCheckStatus ===
          "failed"
            ? "critical"
            : "good",
      },
      {
        label:
          "Overdue deadlines",
        value:
          deadlines.filter(
            (item) =>
              item.effectiveStatus ===
              "overdue",
          ).length,
        tone:
          deadlines.some(
            (item) =>
              item.effectiveStatus ===
              "overdue",
          )
            ? "critical"
            : "good",
      },
      {
        label: "Open findings",
        value: findings.length,
        tone:
          findings.length > 0
            ? "critical"
            : "good",
      },
      {
        label:
          "Active remediation",
        value:
          remediations.length,
        tone:
          remediations.length > 0
            ? "warning"
            : "good",
      },
      {
        label:
          "Valid certifications",
        value:
          certifications.filter(
            (item) => item.valid,
          ).length,
        tone: "neutral",
      },
      {
        label:
          "Active exceptions",
        value:
          exceptionResourceIds.has(
            resourceId,
          )
            ? 1
            : 0,
        tone:
          exceptionResourceIds.has(
            resourceId,
          )
            ? "warning"
            : "neutral",
      },
      {
        label:
          "Invalid audit chains",
        value: 0,
        tone: "good",
      },
    ],
    resources: [resource],
    deadlines,
    findings,
    remediations,
    certifications,
    filings: [],
    audit: {
      chainCount: 1,
      invalidChainCount: 0,
      allChainsValid: true,
    },
  };
}

export function renderFederalDemoReport(
  format: "json" | "csv" | "text",
  resourceId?: string,
): {
  body: string;
  mediaType: string;
} | null {
  const data =
    buildFederalDemoDashboard(
      resourceId,
    );

  if (!data) {
    return null;
  }

  if (format === "json") {
    return {
      body: JSON.stringify(
        {
          demo: true,
          fictional: true,
          dashboard: data,
        },
        null,
        2,
      ),
      mediaType:
        "application/json; charset=utf-8",
    };
  }

  if (format === "csv") {
    const rows = [
      [
        "resource_id",
        "name",
        "type",
        "latest_check",
        "open_findings",
        "overdue_deadlines",
        "valid_certifications",
      ],
      ...data.resources.map(
        (item) => [
          item.id,
          item.name,
          item.resourceType,
          item.latestCheckStatus ??
            "",
          String(
            item.unresolvedFindings,
          ),
          String(
            item.overdueDeadlines,
          ),
          String(
            item.validCertifications,
          ),
        ],
      ),
    ];

    return {
      body:
        rows
          .map((row) =>
            row
              .map(csvCell)
              .join(","),
          )
          .join("\n") + "\n",
      mediaType:
        "text/csv; charset=utf-8",
    };
  }

  return {
    body: [
      "FEDERAL ENCRYPTION COMPLIANCE — FICTIONAL DEMO",
      "",
      "Organization: " +
        data.organization.name,
      "As of: " +
        (data.asOf ?? ""),
      "",
      ...data.metrics.map(
        (metric) =>
          metric.label +
          ": " +
          metric.value,
      ),
      "",
      "Resources:",
      ...data.resources.map(
        (item) =>
          "- " +
          item.name +
          " | " +
          (item.latestCheckStatus ??
            "not checked"),
      ),
    ].join("\n"),
    mediaType:
      "text/plain; charset=utf-8",
  };
}

function csvCell(
  value: string,
): string {
  if (
    /[",\n]/.test(value)
  ) {
    return (
      '"' +
      value.replace(
        /"/g,
        '""',
      ) +
      '"'
    );
  }

  return value;
}
