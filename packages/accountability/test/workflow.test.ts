import assert from "node:assert/strict";
import test from "node:test";
import {
  FederalAccountabilityManager,
} from "../src/index.js";

const ORG =
  "11111111-1111-4111-8111-111111111111";

function response(
  value: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(value),
    {
      status,
      headers: {
        "content-type":
          "application/json",
      },
    },
  );
}

function requestBody(
  init?: RequestInit,
): Record<string, any> {
  return JSON.parse(
    String(
      init?.body ??
        "{}",
    ),
  ) as Record<
    string,
    any
  >;
}

function deadlineView(
  id: string,
  dueAt:
    string = "2027-03-15T12:00:00.000Z",
) {
  return {
    deadline: {
      id,
      organizationId:
        ORG,
      resourceId:
        "agency-1",
      subjectType:
        "fdea-quarterly-progress-update",
      subjectId:
        "agency-1:filing-1:1",
      deadlineType:
        "fdea.s6.quarterly-progress-update",
      status: "scheduled",
      createdByPrincipalId:
        "agency-head",
      anchorAt: null,
      dueOffsetSeconds:
        null,
      dueAt,
      warningWindowSeconds:
        0,
      gracePeriodSeconds:
        0,
      recurrenceIntervalSeconds:
        null,
      recurrenceEndAt:
        null,
      maxOccurrences:
        null,
      cycleNumber: 1,
      escalationAfterSeconds:
        [],
      escalationLevel: 0,
      satisfiedAt: null,
      createdAt:
        "2026-12-15T12:00:00.000Z",
      updatedAt:
        "2026-12-15T12:00:00.000Z",
      metadata: {},
    },
    clock: {
      status: "scheduled",
      escalationLevel: 0,
      warningAt: dueAt,
      dueAt,
      overdueAt: dueAt,
    },
    occurrences: [],
  };
}

function managerWith(
  fetchImpl: typeof fetch,
) {
  return new FederalAccountabilityManager({
    baseUrl:
      "https://engine.example",
    organizationId: ORG,
    operatorToken:
      "caiau_operator_secret",
    enactmentAt:
      "2026-01-01T00:00:00.000Z",
    enactmentReference:
      "Public Law enactment reference",
    fetchImpl,
  });
}

test("findings, remediation, and positive certification stay on typed SDK lifecycle", async () => {
  const calls: Array<{
    url: string;
    init?: RequestInit;
  }> = [];

  const findingView = {
    finding: {
      id: "finding-1",
      status: "open",
    },
    remediations: [],
  };

  const manager =
    managerWith(
      async (
        input,
        init,
      ) => {
        const url =
          String(input);
        calls.push({
          url,
          init,
        });

        if (
          url.includes(
            "/findings/sync",
          )
        ) {
          return response({
            findings: [
              findingView.finding,
            ],
          });
        }

        if (
          url.endsWith(
            "/v1/certifications",
          )
        ) {
          return response(
            {
              certification: {
                id: "cert-1",
              },
            },
            201,
          );
        }

        return response(
          findingView,
          url.endsWith(
            "/remediations",
          )
            ? 201
            : 200,
        );
      },
    );

  const findings =
    await manager
      .syncFindingsFromFailedCheck(
        "check/1",
      );
  assert.equal(
    findings.length,
    1,
  );

  await manager
    .createRemediation(
      "finding/1",
      {
        kind:
          "agency-remediation",
        createdByPrincipalId:
          "operator-principal",
        ownerPrincipalId:
          "owner-principal",
        plan:
          "Replace the noncompliant cryptographic configuration.",
        dueAt:
          "2027-01-15T00:00:00.000Z",
      },
    );

  await manager
    .issueSystemComplianceCertification(
      {
        resourceId:
          "system/1",
        supportingCheckId:
          "passed-check/1",
        issuedByPrincipalId:
          "agency-head",
        validitySeconds:
          86400,
        maximumCheckAgeSeconds:
          3600,
      },
    );

  assert.match(
    calls[0]!.url,
    /\/v1\/checks\/check%2F1\/findings\/sync$/,
  );

  const remediationCall =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/remediations",
        ),
    );
  assert.ok(
    remediationCall,
  );
  const remediationBody =
    requestBody(
      remediationCall.init,
    );
  assert.equal(
    remediationBody
      .metadata
      .federalEncryption
      .obligation,
    "agency-remediation",
  );
  assert.equal(
    remediationBody
      .gracePeriodSeconds,
    0,
  );

  const certificationCall =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/certifications",
        ),
    );
  assert.ok(
    certificationCall,
  );
  const certificationBody =
    requestBody(
      certificationCall.init,
    );
  assert.equal(
    certificationBody
      .organizationId,
    ORG,
  );
  assert.equal(
    certificationBody
      .certificationType,
    "fdea.system-compliance",
  );
  assert.deepEqual(
    certificationBody
      .criteria
      .blockingFindingSeverities,
    [
      "info",
      "low",
      "medium",
      "high",
      "critical",
    ],
  );
  assert.equal(
    certificationBody
      .metadata
      .federalEncryption
      .statutoryAnnualFiling,
    false,
  );
});

test("OMB corrective-action remediation reuses the oversight clock instead of creating a duplicate remediation clock", async () => {
  let body:
    Record<string, any> =
    {};

  const manager =
    managerWith(
      async (
        input,
        init,
      ) => {
        const url =
          String(input);

        if (
          url.endsWith(
            "/remediations",
          )
        ) {
          body =
            requestBody(init);
          return response(
            {
              finding: {
                id: "finding-1",
              },
              remediations: [],
            },
            201,
          );
        }

        throw new Error(
          "unexpected request " +
            url,
        );
      },
    );

  await manager
    .createRemediation(
      "finding-1",
      {
        kind:
          "omb-corrective-action",
        createdByPrincipalId:
          "operator-principal",
        plan:
          "Complete OMB-approved corrective milestone.",
        correctiveActionPlanReference:
          "omb-cap-1",
        milestoneId:
          "milestone-1",
        oversightDeadlineId:
          "deadline-omb-1",
      },
    );

  assert.equal(
    body.dueAt,
    undefined,
  );
  assert.equal(
    body.metadata
      .federalEncryption
      .oversightDeadlineId,
    "deadline-omb-1",
  );
  assert.equal(
    body.metadata
      .federalEncryption
      .deadlineOwnership,
    "fdea-oversight-clock",
  );
});

test("noncompliant annual filing persists statutory report, schedules quarterly follow-up, and satisfies the annual clock", async () => {
  const calls: Array<{
    url: string;
    init?: RequestInit;
  }> = [];
  let storedFiling:
    Record<string, any> |
    null = null;

  const manager =
    managerWith(
      async (
        input,
        init,
      ) => {
        const url =
          String(input);
        calls.push({
          url,
          init,
        });

        if (
          url.includes(
            "/resources?",
          )
        ) {
          return response(
            storedFiling
              ? [
                  storedFiling,
                ]
              : [],
          );
        }

        if (
          url.endsWith(
            "/v1/resources",
          )
        ) {
          const body =
            requestBody(init);
          storedFiling = {
            id: "filing-1",
            organizationId:
              ORG,
            resourceType:
              body.resourceType,
            name: body.name,
            externalRef:
              body.externalRef,
            status:
              body.status,
            attributes:
              body.attributes,
            metadata:
              body.metadata,
            createdAt:
              "2026-12-15T12:00:00.000Z",
            updatedAt:
              "2026-12-15T12:00:00.000Z",
          };
          return response(
            storedFiling,
            201,
          );
        }

        if (
          url.includes(
            "/subjects/fdea-quarterly-progress-update/",
          )
        ) {
          return response([]);
        }

        if (
          url.endsWith(
            "/v1/deadlines",
          )
        ) {
          return response(
            deadlineView(
              "quarterly-1",
            ),
            201,
          );
        }

        if (
          url.endsWith(
            "/v1/deadlines/annual-deadline/status",
          )
        ) {
          return response({
            status:
              "scheduled",
            escalationLevel: 0,
            warningAt:
              "2026-12-15T12:00:00.000Z",
            dueAt:
              "2026-12-31T23:59:59.000Z",
            overdueAt:
              "2026-12-31T23:59:59.000Z",
          });
        }

        if (
          url.endsWith(
            "/v1/deadlines/annual-deadline/satisfy",
          )
        ) {
          return response(
            deadlineView(
              "annual-deadline",
              "2026-12-31T23:59:59.000Z",
            ),
          );
        }

        throw new Error(
          "unexpected request " +
            url,
        );
      },
    );

  const result =
    await manager
      .submitAnnualCertificationFiling(
        {
          agencyResourceId:
            "agency-1",
          reportingYear: 2026,
          submittedAt:
            "2026-12-15T12:00:00.000Z",
          certifyingPrincipalId:
            "agency-head",
          annualDeadlineId:
            "annual-deadline",
          incidentReportingPeriod: {
            startAt:
              "2025-12-15T12:00:00.000Z",
            endAt:
              "2026-12-14T23:59:59.000Z",
          },
          systems: [
            {
              resourceId:
                "system-1",
              supportingCheckId:
                "failed-check-1",
              handlesCoveredInformation:
                true,
              overallCompliance:
                "fail",
              transitEncryption:
                "pass",
              atRestEncryption:
                "fail",
              noncomplianceReasons: [
                "At-rest encryption migration is incomplete.",
              ],
            },
          ],
          incidents: [],
          remediationPlans: [
            {
              reference:
                "plan-1",
              description:
                "Complete at-rest encryption migration.",
              milestones: [
                {
                  milestoneId:
                    "m1",
                  description:
                    "Migrate storage.",
                  status:
                    "in_progress",
                },
              ],
            },
          ],
          contractorExternalAttestation: {
            attestedNoLoopholes:
              true,
            narrative:
              "Contractor and external systems were reviewed.",
            supportingReferences: [
              "partner-review-1",
            ],
          },
          inabilityExplanation:
            "One covered system remains in remediation.",
        },
      );

  assert.equal(
    result.report
      .fullCompliance,
    false,
  );
  assert.equal(
    result.filing
      .externalRef,
    "fdea:s6:annual:agency-1:2026",
  );
  assert.equal(
    result
      .nextQuarterlyDeadline
      ?.deadline.id,
    "quarterly-1",
  );

  const createFiling =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/resources",
        ),
    );
  assert.ok(
    createFiling,
  );
  const filingBody =
    requestBody(
      createFiling.init,
    );
  assert.equal(
    filingBody.resourceType,
    "fdea-annual-certification-filing",
  );
  assert.equal(
    filingBody.attributes
      .report
      .fullCompliance,
    false,
  );

  const quarterlyCreate =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/deadlines",
        ),
    );
  assert.ok(
    quarterlyCreate,
  );
  const quarterlyBody =
    requestBody(
      quarterlyCreate.init,
    );
  assert.equal(
    quarterlyBody
      .deadlineType,
    "fdea.s6.quarterly-progress-update",
  );
  assert.equal(
    quarterlyBody.dueAt,
    "2027-03-15T12:00:00.000Z",
  );

  assert.ok(
    calls.some(
      (call) =>
        call.url.endsWith(
          "/v1/deadlines/annual-deadline/satisfy",
        ),
    ),
  );

  await assert.rejects(
    manager
      .submitAnnualCertificationFiling(
        {
          agencyResourceId:
            "agency-1",
          reportingYear: 2026,
          submittedAt:
            "2026-12-15T12:00:00.000Z",
          certifyingPrincipalId:
            "agency-head",
          annualDeadlineId:
            "annual-deadline",
          incidentReportingPeriod: {
            startAt:
              "2025-12-15T12:00:00.000Z",
            endAt:
              "2026-12-14T23:59:59.000Z",
          },
          systems: [
            {
              resourceId:
                "system-1",
              supportingCheckId:
                "failed-check-1",
              handlesCoveredInformation:
                true,
              overallCompliance:
                "fail",
              transitEncryption:
                "pass",
              atRestEncryption:
                "fail",
              noncomplianceReasons: [
                "At-rest encryption migration is incomplete.",
              ],
            },
          ],
          incidents: [],
          remediationPlans: [
            {
              reference:
                "plan-1",
              description:
                "Complete at-rest encryption migration.",
              milestones: [
                {
                  milestoneId:
                    "m1",
                  description:
                    "Migrate storage.",
                  status:
                    "in_progress",
                },
              ],
            },
          ],
          contractorExternalAttestation: {
            attestedNoLoopholes:
              true,
            narrative:
              "Contractor and external systems were reviewed.",
            supportingReferences: [
              "partner-review-1",
            ],
          },
          inabilityExplanation:
            "This altered explanation must not silently replace the filing.",
        },
      ),
    /explicit amendment/,
  );
});

test("OMB milestone deadline cannot be completed until its linked remediation is verified", async () => {
  let verified = false;
  const calls: string[] =
    [];

  const manager =
    managerWith(
      async (
        input,
        init,
      ) => {
        const url =
          String(input);
        calls.push(url);

        if (
          url.endsWith(
            "/v1/findings/finding-1",
          )
        ) {
          return response({
            finding: {
              id: "finding-1",
            },
            remediations: [
              {
                id:
                  "remediation-1",
                status:
                  verified
                    ? "verified"
                    : "in_progress",
                metadata: {
                  federalEncryption: {
                    oversightDeadlineId:
                      "omb-deadline-1",
                  },
                },
              },
            ],
          });
        }

        if (
          url.endsWith(
            "/v1/deadlines/omb-deadline-1/status",
          )
        ) {
          return response({
            status:
              "scheduled",
            escalationLevel: 0,
            warningAt:
              "2027-01-01T00:00:00.000Z",
            dueAt:
              "2027-01-01T00:00:00.000Z",
            overdueAt:
              "2027-01-01T00:00:00.000Z",
          });
        }

        if (
          url.endsWith(
            "/v1/deadlines/omb-deadline-1/satisfy",
          )
        ) {
          return response(
            deadlineView(
              "omb-deadline-1",
              "2027-01-01T00:00:00.000Z",
            ),
          );
        }

        throw new Error(
          "unexpected request " +
            url +
            " " +
            String(
              init?.method,
            ),
        );
      },
    );

  await assert.rejects(
    manager
      .completeOmbMilestoneFromVerifiedRemediation(
        {
          findingId:
            "finding-1",
          remediationId:
            "remediation-1",
          oversightDeadlineId:
            "omb-deadline-1",
          principalId:
            "reviewer-principal",
        },
      ),
    /verified remediation/,
  );

  assert.equal(
    calls.some(
      (url) =>
        url.includes(
          "/deadlines/",
        ),
    ),
    false,
  );

  verified = true;

  await manager
    .completeOmbMilestoneFromVerifiedRemediation(
      {
        findingId:
          "finding-1",
        remediationId:
          "remediation-1",
        oversightDeadlineId:
          "omb-deadline-1",
        principalId:
          "reviewer-principal",
      },
    );

  assert.ok(
    calls.some(
      (url) =>
        url.endsWith(
          "/v1/deadlines/omb-deadline-1/satisfy",
        ),
    ),
  );
});
