import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAnnualCertificationReport,
  buildQuarterlyProgressReport,
  summarizeCompliance,
} from "../src/index.js";

const passingSystem = {
  resourceId: "system-a",
  supportingCheckId: "check-a",
  name: "System A",
  category: "mission",
  handlesCoveredInformation: true,
  overallCompliance: "pass" as const,
  transitEncryption: "pass" as const,
  atRestEncryption: "pass" as const,
};

const failingSystem = {
  resourceId: "system-b",
  supportingCheckId: "check-b",
  name: "System B",
  category: "legacy",
  handlesCoveredInformation: true,
  overallCompliance: "fail" as const,
  transitEncryption: "pass" as const,
  atRestEncryption: "fail" as const,
  noncomplianceReasons: [
    "Legacy storage is not yet encrypted at rest.",
  ],
};

const attestation = {
  attestedNoLoopholes: true,
  narrative:
    "Contractors and external systems were reviewed against Sections 4 and 5.",
  supportingReferences: [
    "contractor-assessment-2026",
  ],
};

const remediationPlans = [
  {
    reference: "plan-1",
    description:
      "Replace legacy storage and validate encryption.",
    milestones: [
      {
        milestoneId: "m1",
        description:
          "Migrate legacy storage.",
        dueAt:
          "2027-02-01T00:00:00.000Z",
        status: "planned" as const,
      },
    ],
    expectedCompletionAt:
      "2027-03-01T00:00:00.000Z",
    resourceNeeds:
      "Migration engineering capacity.",
  },
];

test("compliance summary derives statutory counts and percentages", () => {
  const summary =
    summarizeCompliance([
      passingSystem,
      failingSystem,
      {
        ...passingSystem,
        resourceId:
          "system-out-of-scope",
        supportingCheckId:
          "check-out-of-scope",
        handlesCoveredInformation:
          false,
        overallCompliance:
          "not_applicable",
        transitEncryption:
          "not_applicable",
        atRestEncryption:
          "not_applicable",
      },
    ]);

  assert.equal(
    summary.coveredSystems,
    2,
  );
  assert.deepEqual(
    summary.overall,
    {
      compliant: 1,
      total: 2,
      percentage: 50,
    },
  );
  assert.deepEqual(
    summary.encryptionInTransit,
    {
      compliant: 2,
      total: 2,
      percentage: 100,
    },
  );
  assert.deepEqual(
    summary.encryptionAtRest,
    {
      compliant: 1,
      total: 2,
      percentage: 50,
    },
  );
  assert.equal(
    summary.noncompliantSystems
      .length,
    1,
  );
  assert.equal(
    summary.noncompliantSystems[0]
      ?.resourceId,
    "system-b",
  );
});

test("noncompliant annual filing requires explanation and remediation", () => {
  const base = {
    agencyResourceId:
      "agency-1",
    reportingYear: 2026,
    submittedAt:
      "2026-12-15T12:00:00.000Z",
    certifyingPrincipalId:
      "agency-head",
    incidentReportingPeriod: {
      startAt:
        "2025-12-15T12:00:00.000Z",
      endAt:
        "2026-12-14T23:59:59.000Z",
    },
    systems: [
      passingSystem,
      failingSystem,
    ],
    incidents: [],
    contractorExternalAttestation:
      attestation,
  };

  assert.throws(
    () =>
      buildAnnualCertificationReport(
        {
          ...base,
          remediationPlans: [],
          inabilityExplanation:
            "System B remains noncompliant.",
        },
      ),
    /remediation plan/,
  );

  assert.throws(
    () =>
      buildAnnualCertificationReport(
        {
          ...base,
          remediationPlans,
        },
      ),
    /inabilityExplanation/,
  );

  const report =
    buildAnnualCertificationReport(
      {
        ...base,
        remediationPlans,
        inabilityExplanation:
          "System B remains in a scheduled migration.",
      },
    );

  assert.equal(
    report.fullCompliance,
    false,
  );
  assert.equal(
    report.compliance
      .noncompliantSystems
      .length,
    1,
  );
  assert.deepEqual(
    report.supportingCheckIds,
    [
      "check-a",
      "check-b",
    ],
  );
});

test("fully compliant annual filing rejects contradictory inability explanation", () => {
  const input = {
    agencyResourceId:
      "agency-1",
    reportingYear: 2026,
    submittedAt:
      "2026-12-15T12:00:00.000Z",
    certifyingPrincipalId:
      "agency-head",
    incidentReportingPeriod: {
      startAt:
        "2025-12-15T12:00:00.000Z",
      endAt:
        "2026-12-14T23:59:59.000Z",
    },
    systems: [
      passingSystem,
    ],
    incidents: [],
    remediationPlans: [],
    contractorExternalAttestation:
      attestation,
  };

  const report =
    buildAnnualCertificationReport(
      input,
    );

  assert.equal(
    report.fullCompliance,
    true,
  );
  assert.equal(
    report.inabilityExplanation,
    null,
  );

  assert.throws(
    () =>
      buildAnnualCertificationReport(
        {
          ...input,
          inabilityExplanation:
            "Contradictory explanation",
        },
      ),
    /must be omitted/,
  );
});

test("incident disclosure requires remedial actions", () => {
  assert.throws(
    () =>
      buildAnnualCertificationReport(
        {
          agencyResourceId:
            "agency-1",
          reportingYear: 2026,
          submittedAt:
            "2026-12-15T12:00:00.000Z",
          certifyingPrincipalId:
            "agency-head",
          incidentReportingPeriod: {
            startAt:
              "2025-12-15T12:00:00.000Z",
            endAt:
              "2026-12-14T23:59:59.000Z",
          },
          systems: [
            passingSystem,
          ],
          incidents: [
            {
              incidentReference:
                "incident-1",
              exposure:
                "at_rest",
              description:
                "Unencrypted covered information was discovered.",
              remedialActions: [],
            },
          ],
          remediationPlans: [],
          contractorExternalAttestation:
            attestation,
        },
      ),
    /remedial action/,
  );
});

test("quarterly update continues remediation requirements only while noncompliant", () => {
  assert.throws(
    () =>
      buildQuarterlyProgressReport(
        {
          agencyResourceId:
            "agency-1",
          rootNoncomplianceReference:
            "annual-filing-1",
          sequence: 1,
          submittedAt:
            "2027-03-15T12:00:00.000Z",
          submittedByPrincipalId:
            "agency-head",
          systems: [
            failingSystem,
          ],
          remediationPlans: [],
          contractorExternalAttestation:
            attestation,
          progressNarrative:
            "Migration is underway.",
        },
      ),
    /remediation plan/,
  );

  const continuing =
    buildQuarterlyProgressReport(
      {
        agencyResourceId:
          "agency-1",
        rootNoncomplianceReference:
          "annual-filing-1",
        sequence: 1,
        submittedAt:
          "2027-03-15T12:00:00.000Z",
        submittedByPrincipalId:
          "agency-head",
        systems: [
          failingSystem,
        ],
        remediationPlans,
        contractorExternalAttestation:
          attestation,
        progressNarrative:
          "Migration is underway.",
      },
    );

  assert.equal(
    continuing.fullCompliance,
    false,
  );

  const complete =
    buildQuarterlyProgressReport(
      {
        ...continuing,
        reportType: undefined,
        schemaVersion: undefined,
        systems: [
          passingSystem,
        ],
        remediationPlans: [],
      } as never,
    );

  assert.equal(
    complete.fullCompliance,
    true,
  );
});
