import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateRuleSet,
} from "@caiae/rules";
import {
  federalDataEncryptionRuleSet,
} from "@federal-encryption/policy";
import {
  PartnerComplianceManager,
  compliantCloudService,
  compliantContractor,
} from "../src/index.js";

const ORG =
  "11111111-1111-4111-8111-111111111111";
const CONTRACTOR =
  "22222222-2222-4222-8222-222222222222";
const CLOUD =
  "33333333-3333-4333-8333-333333333333";
const CHECK =
  "44444444-4444-4444-8444-444444444444";
const UPDATED_AT =
  "2026-10-06T16:30:00.000Z";
const NEXT_UPDATED_AT =
  "2026-10-06T16:31:00.000Z";

test("contract clause workflow uses optimistic resource update before evidence creation", async () => {
  const calls:
    RecordedCall[] = [];
  const state =
    contractorResource();

  const manager =
    new PartnerComplianceManager({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl:
        statefulFetch(
          calls,
          state,
        ),
    });

  const result =
    await manager
      .recordContractClause(
        CONTRACTOR,
        {
          observedAt:
            "2026-10-06T16:30:00.000Z",
          agreementReference:
            "contract-001",
          arrangementType:
            "contract",
          requiresSection4Compliance:
            true,
          materialCondition:
            true,
          correlationId:
            "contract-clause-test",
        },
      );

  assert.equal(
    result.resource
      .attributes
      .agreementMakesSection4ComplianceMaterialCondition,
    true,
  );

  const patch =
    calls.find(
      (call) =>
        call.method ===
          "PATCH",
    );
  assert.ok(patch);
  assert.equal(
    patch.body
      .expectedUpdatedAt,
    UPDATED_AT,
  );
  assert.equal(
    patch.body
      .correlationId,
    "contract-clause-test",
  );
  assert.equal(
    patch.body.attributes
      .unrelatedExistingField,
    "preserved",
  );
  assert.equal(
    patch.body.attributes
      .agreementMakesSection4ComplianceMaterialCondition,
    true,
  );

  const evidence =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/evidence",
        ),
    );
  assert.ok(evidence);
  assert.equal(
    evidence.body
      .evidenceType,
    "fdea.contract-compliance-clause",
  );
  assert.equal(
    evidence.body
      .attributes
      .materialCondition,
    true,
  );
  assert.ok(
    calls.indexOf(patch) <
      calls.indexOf(evidence),
  );
});

test("periodic contractor evaluation updates operational state and records audit evidence", async () => {
  const calls:
    RecordedCall[] = [];
  const state =
    contractorResource();

  const manager =
    new PartnerComplianceManager({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl:
        statefulFetch(
          calls,
          state,
        ),
    });

  const result =
    await manager
      .recordContractorPeriodicEvaluation(
        CONTRACTOR,
        {
          observedAt:
            "2026-10-06T17:00:00.000Z",
          evaluatorRole:
            "contracting-officer",
          section4ControlsVerified:
            false,
          significantFailureFound:
            true,
          materialBreachDetermination:
            true,
          assessmentReference:
            "periodic-003",
          enforcementDisposition:
            "remediation-required",
        },
      );

  assert.equal(
    result.resource
      .attributes
      .periodicComplianceEvaluationIncorporated,
    true,
  );
  assert.equal(
    result.resource
      .attributes
      .section4ControlsImplemented,
    false,
  );
  assert.equal(
    result.resource
      .attributes
      .lastPeriodicEvaluationAt,
    "2026-10-06T17:00:00.000Z",
  );

  const evidence =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/evidence",
        ),
    );
  assert.equal(
    evidence?.body
      .evidenceType,
    "fdea.contractor-periodic-evaluation",
  );
  assert.equal(
    evidence?.body
      .attributes
      .significantFailureFound,
    true,
  );
});

test("cloud assessment updates cloud-specific state and evidence", async () => {
  const calls:
    RecordedCall[] = [];
  const state =
    cloudResource();

  const manager =
    new PartnerComplianceManager({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl:
        statefulFetch(
          calls,
          state,
        ),
    });

  const result =
    await manager
      .recordExternalServiceAssessment(
        CLOUD,
        {
          observedAt:
            "2026-10-06T17:15:00.000Z",
          section4ControlsVerified:
            true,
          serviceReference:
            "cloud-003",
          cloudDataEncrypted:
            true,
          keysPreventUnauthorizedProviderAccess:
            true,
          providerAccessExplicitlyPermittedByAgency:
            false,
        },
      );

  assert.equal(
    result.resource
      .attributes
      .cloudDataEncrypted,
    true,
  );
  assert.equal(
    result.resource
      .attributes
      .keysPreventUnauthorizedProviderAccess,
    true,
  );

  const evidence =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/evidence",
        ),
    );
  assert.equal(
    evidence?.body
      .evidenceType,
    "fdea.external-service-assessment",
  );
});

test("partner evaluation remains an SDK check workflow", async () => {
  const calls:
    RecordedCall[] = [];
  const state =
    contractorResource();
  const evaluation =
    evaluateRuleSet(
      federalDataEncryptionRuleSet,
      {
        resource: {
          resourceType:
            compliantContractor
              .resource
              .resourceType,
          attributes:
            compliantContractor
              .resource
              .attributes,
        },
        evidenceTypes:
          compliantContractor
            .evidence
            .map(
              (item) =>
                item.evidenceType,
            ),
      },
    );

  const manager =
    new PartnerComplianceManager({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl:
        statefulFetch(
          calls,
          state,
          evaluation,
        ),
    });

  const result =
    await manager
      .evaluatePartner(
        CONTRACTOR,
        {
          evaluationMode: {
            mode:
              "simulation",
          },
        },
      );

  assert.equal(
    result.evaluation
      .evaluation.status,
    "pass",
  );

  const check =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/checks/run",
        ),
    );
  assert.ok(check);
  assert.equal(
    check.body
      .ruleSet.version,
    "2025-draft-2",
  );
  assert.equal(
    check.body
      .registeredRuleSetId,
    undefined,
  );
});

type RecordedCall = {
  url: string;
  method: string;
  body: any;
};

function contractorResource() {
  return {
    id: CONTRACTOR,
    organizationId:
      ORG,
    resourceType:
      "covered-contractor",
    name:
      "Fixture Contractor",
    externalRef:
      "contractor-001",
    status:
      "active",
    attributes: {
      ...compliantContractor
        .resource.attributes,
      agreementMakesSection4ComplianceMaterialCondition:
        false,
      unrelatedExistingField:
        "preserved",
    },
    metadata: {},
    createdAt:
      "2026-10-06T16:00:00.000Z",
    updatedAt:
      UPDATED_AT,
  };
}

function cloudResource() {
  return {
    id: CLOUD,
    organizationId:
      ORG,
    resourceType:
      "external-service",
    name:
      "Fixture Cloud",
    externalRef:
      "cloud-001",
    status:
      "active",
    attributes: {
      ...compliantCloudService
        .resource.attributes,
      cloudDataEncrypted:
        false,
      keysPreventUnauthorizedProviderAccess:
        false,
    },
    metadata: {},
    createdAt:
      "2026-10-06T16:00:00.000Z",
    updatedAt:
      UPDATED_AT,
  };
}

function statefulFetch(
  calls:
    RecordedCall[],
  initialResource:
    ReturnType<
      typeof contractorResource
    > |
    ReturnType<
      typeof cloudResource
    >,
  evaluation?: unknown,
): typeof fetch {
  let resource:
    any = {
      ...initialResource,
      attributes: {
        ...initialResource
          .attributes,
      },
    };
  let evidenceCounter = 0;

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
      method === "GET" &&
      url.endsWith(
        "/v1/resources/" +
          resource.id,
      )
    ) {
      return json(resource);
    }

    if (
      method === "PATCH" &&
      url.endsWith(
        "/v1/resources/" +
          resource.id,
      )
    ) {
      assert.equal(
        body.expectedUpdatedAt,
        resource.updatedAt,
      );
      resource = {
        ...resource,
        name:
          body.name ??
          resource.name,
        externalRef:
          body.externalRef ===
          undefined
            ? resource.externalRef
            : body.externalRef,
        status:
          body.status ??
          resource.status,
        attributes:
          body.attributes ??
          resource.attributes,
        metadata:
          body.metadata ??
          resource.metadata,
        updatedAt:
          NEXT_UPDATED_AT,
      };
      return json(resource);
    }

    if (
      method === "POST" &&
      url.endsWith(
        "/v1/evidence",
      )
    ) {
      evidenceCounter += 1;
      return json(
        {
          id:
            "evidence-" +
            evidenceCounter,
          ...body,
        },
        201,
      );
    }

    if (
      method === "POST" &&
      url.endsWith(
        "/v1/checks/run",
      )
    ) {
      if (!evaluation) {
        throw new Error(
          "evaluation response not configured",
        );
      }
      return json(
        {
          check: {
            id: CHECK,
            organizationId:
              ORG,
            resourceId:
              resource.id,
            status:
              "passed",
            registrationMode:
              body
                ?.registeredRuleSetId
                ? "registered"
                : "ad_hoc",
          },
          evaluation,
        },
        201,
      );
    }

    throw new Error(
      "unexpected request: " +
        method +
        " " +
        url,
    );
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
