import assert from "node:assert/strict";
import test from "node:test";
import type {
  Resource,
} from "@caiae/sdk";
import {
  projectComplianceReport,
} from "../lib/dashboard";

const report = {
  generatedAt:
    "2026-10-07T16:00:00.000Z",
  asOf:
    "2026-10-07T16:00:00.000Z",
  organization: {
    id: "org-1",
    name:
      "Example Federal Agency",
    slug: "example",
    status: "active",
  },
  resources: [
    {
      id: "system-1",
      resourceType:
        "information-system",
      name:
        "Mission System",
      status: "active",
      externalRef: null,
    },
    {
      id: "system-2",
      resourceType:
        "information-system",
      name:
        "Legacy System",
      status: "active",
      externalRef: null,
    },
  ],
  checks: [
    {
      id: "check-2",
      resourceId:
        "system-2",
      status: "failed",
    },
    {
      id: "check-1",
      resourceId:
        "system-1",
      status: "passed",
    },
  ],
  exceptions: [
    {
      id: "exception-1",
      resourceId:
        "system-2",
      effectiveStatus:
        "active",
    },
  ],
  deadlines: [
    {
      id: "deadline-2",
      resourceId:
        "system-2",
      subjectType:
        "remediation",
      subjectId:
        "remediation-1",
      deadlineType:
        "remediation-completion",
      effectiveStatus:
        "overdue",
      dueAt:
        "2026-10-01T00:00:00.000Z",
    },
    {
      id: "deadline-1",
      resourceId:
        "system-1",
      subjectType:
        "fdea-annual-certification",
      subjectId:
        "agency-1:2026",
      deadlineType:
        "fdea.s6.annual-certification",
      effectiveStatus:
        "scheduled",
      dueAt:
        "2026-12-31T00:00:00.000Z",
    },
  ],
  findings: [
    {
      id: "finding-1",
      resourceId:
        "system-2",
      severity: "critical",
      status:
        "remediating",
      title:
        "At-rest encryption failed",
      description:
        "Legacy storage remains unencrypted.",
      openedAt:
        "2026-10-01T00:00:00.000Z",
    },
  ],
  remediations: [
    {
      id: "remediation-1",
      findingId:
        "finding-1",
      resourceId:
        "system-2",
      status:
        "in_progress",
      plan:
        "Migrate legacy storage.",
      dueAt:
        "2026-10-01T00:00:00.000Z",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      resourceId:
        "system-1",
      certificationType:
        "fdea.system-compliance",
      certificateNumber:
        "CERT-1",
      effectiveStatus:
        "active",
      valid: true,
      validUntil:
        "2027-01-01T00:00:00.000Z",
    },
  ],
  auditChains: [
    {
      aggregateType:
        "check",
      aggregateId:
        "check-1",
      valid: true,
    },
    {
      aggregateType:
        "finding",
      aggregateId:
        "finding-1",
      valid: false,
    },
  ],
};

const filing: Resource = {
  id: "filing-1",
  organizationId:
    "org-1",
  resourceType:
    "fdea-annual-certification-filing",
  name:
    "FDEA Section 6 annual certification filing 2026",
  externalRef:
    "fdea:s6:annual:agency-1:2026",
  status: "active",
  attributes: {
    report: {
      reportType:
        "fdea-section-6-annual-certification-filing",
      agencyResourceId:
        "agency-1",
      reportingYear: 2026,
      submittedAt:
        "2026-10-06T12:00:00.000Z",
      fullCompliance:
        false,
    },
  },
  metadata: {},
  createdAt:
    "2026-10-06T12:00:00.000Z",
  updatedAt:
    "2026-10-06T12:00:00.000Z",
};

test("dashboard projection exposes operational posture without recomputing engine state machines", () => {
  const dashboard =
    projectComplianceReport(
      report,
      [filing],
    );

  assert.equal(
    dashboard.organization.name,
    "Example Federal Agency",
  );

  const metric =
    Object.fromEntries(
      dashboard.metrics.map(
        (item) => [
          item.label,
          item.value,
        ],
      ),
    );

  assert.equal(
    metric["Failed checks"],
    1,
  );
  assert.equal(
    metric["Overdue deadlines"],
    1,
  );
  assert.equal(
    metric["Open findings"],
    1,
  );
  assert.equal(
    metric["Invalid audit chains"],
    1,
  );

  const legacy =
    dashboard.resources.find(
      (resource) =>
        resource.id ===
        "system-2",
    );
  assert.equal(
    legacy?.latestCheckStatus,
    "failed",
  );
  assert.equal(
    legacy?.unresolvedFindings,
    1,
  );
  assert.equal(
    legacy?.overdueDeadlines,
    1,
  );

  assert.equal(
    dashboard.deadlines[0]
      ?.id,
    "deadline-2",
  );
  assert.equal(
    dashboard.filings[0]
      ?.fullCompliance,
    false,
  );
  assert.equal(
    dashboard.audit
      .allChainsValid,
    false,
  );
});

test("resolved findings and satisfied clocks leave attention queues", () => {
  const dashboard =
    projectComplianceReport({
      ...report,
      findings: [
        {
          ...report.findings[0],
          status: "resolved",
        },
      ],
      deadlines: [
        {
          ...report.deadlines[0],
          effectiveStatus:
            "satisfied",
        },
      ],
      auditChains: [
        {
          valid: true,
        },
      ],
    });

  assert.equal(
    dashboard.findings.length,
    0,
  );
  assert.equal(
    dashboard.deadlines.length,
    0,
  );
  assert.equal(
    dashboard.audit
      .allChainsValid,
    true,
  );
});
