import assert from "node:assert/strict";
import test from "node:test";
import {
  FederalExceptionManager,
} from "../src/index.js";

const ORG =
  "11111111-1111-4111-8111-111111111111";
const RESOURCE =
  "22222222-2222-4222-8222-222222222222";

test("technical-impracticability waiver is narrow, bounded, and carries compensating controls", async () => {
  const calls: RecordedCall[] = [];
  const manager =
    managerWith(calls);

  await manager
    .requestTechnicalImpracticabilityWaiver({
      resourceId:
        RESOURCE,
      targetRuleId:
        "fdea.s4.at-rest-encryption",
      requestedByPrincipalId:
        "requester",
      technicalImpracticability:
        "Legacy controller cannot support the required cryptographic module until replacement.",
      riskAssessmentReference:
        "RA-2026-17",
      compensatingControls: [
        {
          controlId:
            "CC-1",
          description:
            "Physical isolation and monitored access",
          verificationReference:
            "ASSESS-44",
        },
      ],
      scope: {
        subsystem:
          "legacy-controller-7",
      },
      validFrom:
        "2026-10-06T18:00:00.000Z",
      validUntil:
        "2027-10-06T17:59:59.000Z",
      approvalAuthority:
        "agency-cio",
      eligibleApproverPrincipalIds: [
        "cio-principal",
      ],
      correlationId:
        "waiver-test",
    });

  const body =
    calls[0]!.body;
  assert.equal(
    body.kind,
    "waiver",
  );
  assert.equal(
    body.ruleId,
    "fdea.s4.at-rest-encryption",
  );
  assert.equal(
    body.metadata
      .federalEncryption
      .blanketWaiver,
    false,
  );
  assert.equal(
    body.conditions
      .compensatingControls
      .length,
    1,
  );
  assert.equal(
    body.conditions
      .renewalRequiresFreshRequest,
    true,
  );
});

test("waiver rejects a blanket target and a window longer than one year", async () => {
  const manager =
    managerWith([]);

  await assert.rejects(
    manager
      .requestTechnicalImpracticabilityWaiver({
        resourceId:
          RESOURCE,
        targetRuleId:
          "*",
        requestedByPrincipalId:
          "requester",
        technicalImpracticability:
          "Specific technical constraint",
        riskAssessmentReference:
          "RA-1",
        compensatingControls: [
          {
            controlId:
              "CC-1",
            description:
              "Isolation",
            verificationReference:
              "VERIFY-1",
          },
        ],
        scope: {
          subsystem:
            "legacy",
        },
        validFrom:
          "2026-10-06T18:00:00.000Z",
        validUntil:
          "2027-10-06T18:00:00.001Z",
        approvalAuthority:
          "agency-cio",
        eligibleApproverPrincipalIds: [
          "cio-principal",
        ],
      }),
    /one year|blanket/,
  );
});

test("emergency communications use immediate emergency authorization with mandatory review", async () => {
  const calls: RecordedCall[] = [];
  const manager =
    managerWith(calls);

  await manager
    .requestEmergencyCommunicationsException({
      resourceId:
        RESOURCE,
      requestedByPrincipalId:
        "incident-commander",
      emergencyDescription:
        "Primary compliant communications path unavailable during disaster response.",
      communicationPurpose:
        "Life-safety coordination",
      scope: {
        incident:
          "INC-42",
        channel:
          "backup-radio-gateway",
      },
      validUntil:
        "2099-10-06T22:00:00.000Z",
      emergencyReviewDueAt:
        "2099-10-06T20:00:00.000Z",
      approvalAuthority:
        "agency-cio",
      eligibleApproverPrincipalIds: [
        "cio-principal",
      ],
    });

  const body =
    calls[0]!.body;
  assert.equal(
    body.authorizationType,
    "fdea.s7.emergency-communications",
  );
  assert.equal(
    body.emergency,
    true,
  );
  assert.equal(
    body.conditions
      .mandatoryPostEmergencyReview,
    true,
  );
  assert.equal(
    body.conditions
      .ordinaryControlsResumeWhenEmergencyEnds,
    true,
  );
});

test("classified-system exception requires a directive reference and remains rule-specific", async () => {
  const calls: RecordedCall[] = [];
  const manager =
    managerWith(calls);

  await manager
    .requestClassifiedSystemException({
      resourceId:
        RESOURCE,
      targetRuleId:
        "fdea.s4.key-management",
      requestedByPrincipalId:
        "security-officer",
      classifiedDirectiveReference:
        "CLASS-DIR-17",
      conflictDescription:
        "Specific classified handling directive conflicts with the ordinary key-management implementation.",
      compensatingControls: [
        {
          controlId:
            "CLASS-CC-1",
          description:
            "Compartmented offline key custody",
          verificationReference:
            "CLASS-ASSESS-9",
        },
      ],
      scope: {
        enclave:
          "classified-enclave-a",
      },
      validFrom:
        "2026-10-06T18:00:00.000Z",
      validUntil:
        "2027-01-01T00:00:00.000Z",
      approvalAuthority:
        "designated-security-authority",
      eligibleApproverPrincipalIds: [
        "dsa-principal",
      ],
    });

  assert.equal(
    calls[0]!.body.kind,
    "exception",
  );
  assert.equal(
    calls[0]!.body.conditions
      .classifiedDirectiveReference,
    "CLASS-DIR-17",
  );
  assert.equal(
    calls[0]!.body.metadata
      .federalEncryption
      .blanketWaiver,
    false,
  );
});

test("waiver approval and emergency review stay on typed SDK endpoints", async () => {
  const calls: RecordedCall[] = [];
  const manager =
    managerWith(calls);

  await manager.approveWaiver(
    "waiver-1",
    "cio-principal",
    "Approved with compensating controls",
  );
  await manager
    .reviewEmergencyCommunications(
      "auth-1",
      {
        principalId:
          "cio-principal",
        decision:
          "approve",
        rationale:
          "Emergency use was necessary and appropriately scoped",
      },
    );

  assert.match(
    calls[0]!.url,
    /\/v1\/exceptions\/waiver-1\/decisions$/,
  );
  assert.match(
    calls[1]!.url,
    /\/v1\/authorizations\/auth-1\/decisions$/,
  );
});

type RecordedCall = {
  url: string;
  method: string;
  body: any;
};

function managerWith(
  calls: RecordedCall[],
) {
  return new FederalExceptionManager({
    baseUrl:
      "https://engine.example.gov",
    organizationId:
      ORG,
    operatorToken:
      "caiau_test_operator",
    fetchImpl:
      fakeFetch(calls),
  });
}

function fakeFetch(
  calls: RecordedCall[],
): typeof fetch {
  return async (
    input,
    init,
  ) => {
    const url =
      String(input);
    const method =
      init?.method ??
      "GET";
    const body =
      init?.body
        ? JSON.parse(
            String(init.body),
          )
        : null;

    calls.push({
      url,
      method,
      body,
    });

    if (
      url.endsWith(
        "/v1/exceptions",
      )
    ) {
      return json(
        exceptionView(
          body,
        ),
        201,
      );
    }

    if (
      url.endsWith(
        "/v1/authorizations",
      )
    ) {
      return json(
        authorizationView(
          body,
        ),
        201,
      );
    }

    if (
      /\/decisions$/.test(
        url,
      )
    ) {
      return json(
        url.includes(
          "/exceptions/",
        )
          ? exceptionView(
              body,
            )
          : authorizationView(
              body,
            ),
      );
    }

    if (
      /\/effectiveness/.test(
        url,
      )
    ) {
      return json({
        effective:
          true,
        reason:
          "approved",
      });
    }

    throw new Error(
      "unexpected request: " +
        method +
        " " +
        url,
    );
  };
}

function exceptionView(
  body: any,
) {
  return {
    exception: {
      id:
        "waiver-1",
      organizationId:
        ORG,
      resourceId:
        body.resourceId ??
        RESOURCE,
      ruleId:
        body.ruleId ??
        null,
      kind:
        body.kind ??
        "waiver",
      status:
        "requested",
      requestedByPrincipalId:
        body.requestedByPrincipalId ??
        "requester",
      decidedByPrincipalId:
        null,
      requestedAt:
        "2026-10-06T18:00:00.000Z",
      decidedAt:
        null,
      justification:
        body.justification ??
        "",
      validFrom:
        body.validFrom ??
        null,
      validUntil:
        body.validUntil ??
        "2027-01-01T00:00:00.000Z",
      scope:
        body.scope ??
        {},
      conditions:
        body.conditions ??
        {},
      approvalQuorum:
        body.approvalQuorum ??
        1,
      approvalAuthority:
        body.approvalAuthority ??
        null,
      createdAt:
        "2026-10-06T18:00:00.000Z",
      updatedAt:
        "2026-10-06T18:00:00.000Z",
      metadata:
        body.metadata ??
        {},
    },
    decisions: [],
    eligibleApproverPrincipalIds:
      body.eligibleApproverPrincipalIds ??
      [],
    approvalCount:
      0,
  };
}

function authorizationView(
  body: any,
) {
  return {
    authorization: {
      id:
        "auth-1",
      organizationId:
        ORG,
      resourceId:
        body.resourceId ??
        RESOURCE,
      authorizationType:
        body.authorizationType ??
        "fdea.s7.emergency-communications",
      status:
        "approved",
      requestedByPrincipalId:
        body.requestedByPrincipalId ??
        "requester",
      decidedByPrincipalId:
        null,
      requestedAt:
        "2026-10-06T18:00:00.000Z",
      decidedAt:
        null,
      validFrom:
        "2026-10-06T18:00:00.000Z",
      validUntil:
        body.validUntil ??
        "2099-10-06T22:00:00.000Z",
      scope:
        body.scope ??
        {},
      conditions:
        body.conditions ??
        {},
      approvalQuorum:
        body.approvalQuorum ??
        1,
      approvalAuthority:
        body.approvalAuthority ??
        null,
      emergency:
        body.emergency ??
        true,
      emergencyReviewDueAt:
        body.emergencyReviewDueAt ??
        "2099-10-06T20:00:00.000Z",
      emergencyReviewedAt:
        null,
      createdAt:
        "2026-10-06T18:00:00.000Z",
      updatedAt:
        "2026-10-06T18:00:00.000Z",
      metadata:
        body.metadata ??
        {},
    },
    decisions: [],
    eligibleApproverPrincipalIds:
      body.eligibleApproverPrincipalIds ??
      [],
    approvalCount:
      0,
  };
}

function json(
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
