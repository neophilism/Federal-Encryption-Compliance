import {
  SdkError,
  type ComplianceEngineClient,
  type Resource,
} from "@caiae/sdk";
import {
  createOperatorEngineClient,
  readOperatorReadiness,
  type OperatorEnvironment,
} from "./operator";
import {
  buildFederalDemoDashboard,
} from "./demo";
import {
  isFederalDemoMode,
} from "./demo-mode";

type JsonRecord =
  Record<string, unknown>;

export type DashboardMetric = {
  label: string;
  value: number;
  tone:
    | "neutral"
    | "good"
    | "warning"
    | "critical";
};

export type DashboardResource = {
  id: string;
  resourceType: string;
  name: string;
  status: string;
  latestCheckStatus:
    string | null;
  unresolvedFindings:
    number;
  overdueDeadlines:
    number;
  validCertifications:
    number;
};

export type DashboardDeadline = {
  id: string;
  resourceId: string | null;
  subjectType:
    string | null;
  subjectId: string | null;
  deadlineType: string;
  effectiveStatus:
    string;
  dueAt: string | null;
};

export type DashboardFinding = {
  id: string;
  resourceId: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  openedAt: string | null;
};

export type DashboardRemediation = {
  id: string;
  findingId: string;
  resourceId: string;
  status: string;
  plan: string;
  dueAt: string | null;
};

export type DashboardCertification = {
  id: string;
  resourceId: string;
  certificationType:
    string;
  certificateNumber:
    string | null;
  effectiveStatus: string;
  valid: boolean;
  validUntil: string | null;
};

export type StatutoryFilingSummary = {
  id: string;
  resourceType: string;
  name: string;
  externalRef: string | null;
  reportType: string | null;
  agencyResourceId:
    string | null;
  reportingYear:
    number | null;
  sequence: number | null;
  submittedAt: string | null;
  fullCompliance:
    boolean | null;
};

export type FederalDashboardData = {
  generatedAt: string | null;
  asOf: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  metrics:
    DashboardMetric[];
  resources:
    DashboardResource[];
  deadlines:
    DashboardDeadline[];
  findings:
    DashboardFinding[];
  remediations:
    DashboardRemediation[];
  certifications:
    DashboardCertification[];
  filings:
    StatutoryFilingSummary[];
  audit: {
    chainCount: number;
    invalidChainCount:
      number;
    allChainsValid: boolean;
  };
};

export type FederalDashboardState =
  | {
      state:
        "unconfigured";
      missing: string[];
      engineBaseUrl: string;
    }
  | {
      state: "error";
      message: string;
      engineBaseUrl: string;
    }
  | {
      state: "ready";
      data:
        FederalDashboardData;
      engineBaseUrl: string;
    };

export async function loadFederalDashboard(
  env: OperatorEnvironment =
    process.env as OperatorEnvironment,
): Promise<
  FederalDashboardState
> {
  if (isFederalDemoMode(env)) {
    return {
      state: "ready",
      data: buildFederalDemoDashboard()!,
      engineBaseUrl: "demo://self-contained",
    };
  }

  const readiness =
    readOperatorReadiness(env);

  if (!readiness.configured) {
    return {
      state:
        "unconfigured",
      missing:
        readiness.missing,
      engineBaseUrl:
        readiness.engineBaseUrl,
    };
  }

  try {
    const client =
      createOperatorEngineClient(
        env,
      );
    const [
      report,
      annualFilings,
      quarterlyFilings,
    ] =
      await Promise.all([
        client
          .getComplianceReport(),
        client.listResources({
          resourceType:
            "fdea-annual-certification-filing",
        }),
        client.listResources({
          resourceType:
            "fdea-quarterly-progress-update",
        }),
      ]);

    return {
      state: "ready",
      engineBaseUrl:
        readiness.engineBaseUrl,
      data:
        projectComplianceReport(
          report,
          [
            ...annualFilings,
            ...quarterlyFilings,
          ],
        ),
    };
  } catch (error) {
    return {
      state: "error",
      engineBaseUrl:
        readiness.engineBaseUrl,
      message:
        dashboardErrorMessage(
          error,
        ),
    };
  }
}

export async function loadFederalResourceDashboard(
  resourceId: string,
  env: OperatorEnvironment =
    process.env as OperatorEnvironment,
): Promise<
  FederalDashboardState
> {
  const normalized =
    resourceId.trim();

  if (!normalized) {
    return {
      state: "error",
      engineBaseUrl:
        readOperatorReadiness(
          env,
        ).engineBaseUrl,
      message:
        "resourceId is required",
    };
  }

  if (isFederalDemoMode(env)) {
    const data =
      buildFederalDemoDashboard(
        normalized,
      );

    return data
      ? {
          state: "ready",
          data,
          engineBaseUrl:
            "demo://self-contained",
        }
      : {
          state: "error",
          message:
            "Fictional demo resource not found",
          engineBaseUrl:
            "demo://self-contained",
        };
  }

  const readiness =
    readOperatorReadiness(env);

  if (!readiness.configured) {
    return {
      state:
        "unconfigured",
      missing:
        readiness.missing,
      engineBaseUrl:
        readiness.engineBaseUrl,
    };
  }

  try {
    const client =
      createOperatorEngineClient(
        env,
      );
    const report =
      await client
        .getComplianceReport(
          normalized,
        );

    return {
      state: "ready",
      engineBaseUrl:
        readiness.engineBaseUrl,
      data:
        projectComplianceReport(
          report,
          [],
        ),
    };
  } catch (error) {
    return {
      state: "error",
      engineBaseUrl:
        readiness.engineBaseUrl,
      message:
        dashboardErrorMessage(
          error,
        ),
    };
  }
}

export function projectComplianceReport(
  rawReport: unknown,
  filingResources:
    Resource[] = [],
): FederalDashboardData {
  const report =
    recordValue(
      rawReport,
      "compliance report",
    );
  const organization =
    recordValue(
      report.organization,
      "organization",
    );

  const resources =
    recordArray(
      report.resources,
    );
  const checks =
    recordArray(
      report.checks,
    );
  const deadlines =
    recordArray(
      report.deadlines,
    );
  const findings =
    recordArray(
      report.findings,
    );
  const remediations =
    recordArray(
      report.remediations,
    );
  const certifications =
    recordArray(
      report.certifications,
    );
  const exceptions =
    recordArray(
      report.exceptions,
    );
  const auditChains =
    recordArray(
      report.auditChains,
    );

  const unresolvedFindings =
    findings.filter(
      (finding) =>
        ![
          "resolved",
          "closed",
        ].includes(
          stringValue(
            finding.status,
          ),
        ),
    );
  const severeFindings =
    unresolvedFindings
      .filter(
        (finding) =>
          [
            "high",
            "critical",
          ].includes(
            stringValue(
              finding.severity,
            ),
          ),
      );
  const overdueDeadlines =
    deadlines.filter(
      (deadline) =>
        deadlineStatus(
          deadline,
        ) ===
        "overdue",
    );
  const activeRemediations =
    remediations.filter(
      (remediation) =>
        [
          "planned",
          "in_progress",
          "ready_for_verification",
        ].includes(
          stringValue(
            remediation.status,
          ),
        ),
    );
  const validCertifications =
    certifications.filter(
      (certification) =>
        certification.valid ===
          true,
    );
  const activeExceptions =
    exceptions.filter(
      (exceptionRecord) =>
        [
          "active",
          "approved",
        ].includes(
          stringValue(
            exceptionRecord
              .effectiveStatus ??
            exceptionRecord.status,
          ),
        ),
    );
  const failedChecks =
    checks.filter(
      (check) =>
        stringValue(
          check.status,
        ) === "failed",
    );
  const invalidAuditChains =
    auditChains.filter(
      (chain) =>
        chain.valid === false,
    );

  const resourceRows =
    resources.map(
      (resource) =>
        projectResource(
          resource,
          checks,
          unresolvedFindings,
          overdueDeadlines,
          validCertifications,
        ),
    );

  const deadlineRows =
    deadlines
      .filter(
        (deadline) =>
          ![
            "satisfied",
            "cancelled",
          ].includes(
            deadlineStatus(
              deadline,
            ),
          ),
      )
      .map(
        projectDeadline,
      )
      .sort(
        compareNullableDate(
          (item) =>
            item.dueAt,
        ),
      );

  const findingRows =
    unresolvedFindings.map(
      projectFinding,
    );
  const remediationRows =
    activeRemediations.map(
      projectRemediation,
    );
  const certificationRows =
    certifications.map(
      projectCertification,
    );
  const filings =
    filingResources
      .map(
        projectFiling,
      )
      .sort(
        compareNullableDateDesc(
          (item) =>
            item.submittedAt,
        ),
      );

  return {
    generatedAt:
      nullableString(
        report.generatedAt,
      ),
    asOf:
      nullableString(
        report.asOf,
      ),
    organization: {
      id:
        stringValue(
          organization.id,
        ),
      name:
        stringValue(
          organization.name,
        ),
      slug:
        stringValue(
          organization.slug,
        ),
      status:
        stringValue(
          organization.status,
        ),
    },
    metrics: [
      {
        label:
          "Resources",
        value:
          resources.length,
        tone: "neutral",
      },
      {
        label:
          "Failed checks",
        value:
          failedChecks.length,
        tone:
          failedChecks.length >
            0
            ? "critical"
            : "good",
      },
      {
        label:
          "Overdue deadlines",
        value:
          overdueDeadlines
            .length,
        tone:
          overdueDeadlines
            .length > 0
            ? "critical"
            : "good",
      },
      {
        label:
          "Open findings",
        value:
          unresolvedFindings
            .length,
        tone:
          severeFindings
            .length > 0
            ? "critical"
            : unresolvedFindings
                  .length > 0
              ? "warning"
              : "good",
      },
      {
        label:
          "Active remediation",
        value:
          activeRemediations
            .length,
        tone:
          activeRemediations
            .length > 0
            ? "warning"
            : "good",
      },
      {
        label:
          "Valid certifications",
        value:
          validCertifications
            .length,
        tone: "neutral",
      },
      {
        label:
          "Active exceptions",
        value:
          activeExceptions
            .length,
        tone:
          activeExceptions
            .length > 0
            ? "warning"
            : "neutral",
      },
      {
        label:
          "Invalid audit chains",
        value:
          invalidAuditChains
            .length,
        tone:
          invalidAuditChains
            .length > 0
            ? "critical"
            : "good",
      },
    ],
    resources:
      resourceRows,
    deadlines:
      deadlineRows,
    findings:
      findingRows,
    remediations:
      remediationRows,
    certifications:
      certificationRows,
    filings,
    audit: {
      chainCount:
        auditChains.length,
      invalidChainCount:
        invalidAuditChains
          .length,
      allChainsValid:
        invalidAuditChains
          .length === 0,
    },
  };
}

function projectResource(
  resource: JsonRecord,
  checks: JsonRecord[],
  findings: JsonRecord[],
  deadlines: JsonRecord[],
  certifications:
    JsonRecord[],
): DashboardResource {
  const id =
    stringValue(
      resource.id,
    );
  const latestCheck =
    checks.find(
      (check) =>
        stringValue(
          check.resourceId,
        ) === id,
    );

  return {
    id,
    resourceType:
      stringValue(
        resource.resourceType,
      ),
    name:
      stringValue(
        resource.name,
      ),
    status:
      stringValue(
        resource.status,
      ),
    latestCheckStatus:
      latestCheck
        ? nullableString(
            latestCheck.status,
          )
        : null,
    unresolvedFindings:
      findings.filter(
        (finding) =>
          stringValue(
            finding.resourceId,
          ) === id,
      ).length,
    overdueDeadlines:
      deadlines.filter(
        (deadline) =>
          nullableString(
            deadline.resourceId,
          ) === id,
      ).length,
    validCertifications:
      certifications.filter(
        (certification) =>
          stringValue(
            certification
              .resourceId,
          ) === id,
      ).length,
  };
}

function projectDeadline(
  deadline: JsonRecord,
): DashboardDeadline {
  return {
    id:
      stringValue(
        deadline.id,
      ),
    resourceId:
      nullableString(
        deadline.resourceId,
      ),
    subjectType:
      nullableString(
        deadline.subjectType,
      ),
    subjectId:
      nullableString(
        deadline.subjectId,
      ),
    deadlineType:
      stringValue(
        deadline.deadlineType,
      ),
    effectiveStatus:
      deadlineStatus(
        deadline,
      ),
    dueAt:
      nullableString(
        deadline.dueAt,
      ),
  };
}

function projectFinding(
  finding: JsonRecord,
): DashboardFinding {
  return {
    id:
      stringValue(
        finding.id,
      ),
    resourceId:
      stringValue(
        finding.resourceId,
      ),
    severity:
      stringValue(
        finding.severity,
      ),
    status:
      stringValue(
        finding.status,
      ),
    title:
      stringValue(
        finding.title,
      ),
    description:
      stringValue(
        finding.description,
      ),
    openedAt:
      nullableString(
        finding.openedAt,
      ),
  };
}

function projectRemediation(
  remediation: JsonRecord,
): DashboardRemediation {
  return {
    id:
      stringValue(
        remediation.id,
      ),
    findingId:
      stringValue(
        remediation.findingId,
      ),
    resourceId:
      stringValue(
        remediation.resourceId,
      ),
    status:
      stringValue(
        remediation.status,
      ),
    plan:
      stringValue(
        remediation.plan,
      ),
    dueAt:
      nullableString(
        remediation.dueAt,
      ),
  };
}

function projectCertification(
  certification: JsonRecord,
): DashboardCertification {
  return {
    id:
      stringValue(
        certification.id,
      ),
    resourceId:
      stringValue(
        certification.resourceId,
      ),
    certificationType:
      stringValue(
        certification
          .certificationType,
      ),
    certificateNumber:
      nullableString(
        certification
          .certificateNumber,
      ),
    effectiveStatus:
      stringValue(
        certification
          .effectiveStatus ??
        certification
          .storedStatus,
      ),
    valid:
      certification.valid ===
        true,
    validUntil:
      nullableString(
        certification
          .validUntil,
      ),
  };
}

function projectFiling(
  resource: Resource,
): StatutoryFilingSummary {
  const report =
    nestedRecord(
      resource.attributes,
      "report",
    );

  return {
    id: resource.id,
    resourceType:
      resource.resourceType,
    name: resource.name,
    externalRef:
      resource.externalRef,
    reportType:
      nullableString(
        report?.reportType,
      ),
    agencyResourceId:
      nullableString(
        report
          ?.agencyResourceId,
      ),
    reportingYear:
      nullableNumber(
        report
          ?.reportingYear,
      ),
    sequence:
      nullableNumber(
        report?.sequence,
      ),
    submittedAt:
      nullableString(
        report
          ?.submittedAt,
      ),
    fullCompliance:
      typeof report
        ?.fullCompliance ===
        "boolean"
        ? report
            .fullCompliance
        : null,
  };
}

function deadlineStatus(
  deadline: JsonRecord,
): string {
  return stringValue(
    deadline
      .effectiveStatus ??
    deadline.status,
  );
}

function recordArray(
  value: unknown,
): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (
          item,
        ): item is JsonRecord =>
          item !== null &&
          typeof item ===
            "object" &&
          !Array.isArray(item),
      )
    : [];
}

function recordValue(
  value: unknown,
  field: string,
): JsonRecord {
  if (
    value === null ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      field +
        " must be an object",
    );
  }

  return value as JsonRecord;
}

function nestedRecord(
  value: unknown,
  key: string,
): JsonRecord | null {
  if (
    value === null ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const nested =
    (
      value as JsonRecord
    )[key];

  return nested !== null &&
    typeof nested ===
      "object" &&
    !Array.isArray(nested)
    ? nested as JsonRecord
    : null;
}

function stringValue(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value
    : "";
}

function nullableString(
  value: unknown,
): string | null {
  return typeof value ===
    "string" &&
    value.trim() !== ""
    ? value
    : null;
}

function nullableNumber(
  value: unknown,
): number | null {
  return typeof value ===
      "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function compareNullableDate<T>(
  value:
    (item: T) =>
      string | null,
) {
  return (
    left: T,
    right: T,
  ) =>
    dateNumber(
      value(left),
      Number.POSITIVE_INFINITY,
    ) -
    dateNumber(
      value(right),
      Number.POSITIVE_INFINITY,
    );
}

function compareNullableDateDesc<T>(
  value:
    (item: T) =>
      string | null,
) {
  return (
    left: T,
    right: T,
  ) =>
    dateNumber(
      value(right),
      Number.NEGATIVE_INFINITY,
    ) -
    dateNumber(
      value(left),
      Number.NEGATIVE_INFINITY,
    );
}

function dateNumber(
  value: string | null,
  fallback: number,
): number {
  if (value === null) {
    return fallback;
  }

  const parsed =
    new Date(value)
      .getTime();

  return Number.isNaN(parsed)
    ? fallback
    : parsed;
}

function dashboardErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
      SdkError
  ) {
    return (
      error.message +
      " (HTTP " +
      error.status +
      ")"
    );
  }

  return error instanceof
    Error
    ? error.message
    : "Unable to load the compliance dashboard";
}

export function dashboardClientForTests(
  client:
    ComplianceEngineClient,
): ComplianceEngineClient {
  return client;
}
