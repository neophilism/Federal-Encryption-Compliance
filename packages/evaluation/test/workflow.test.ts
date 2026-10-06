import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateRuleSet,
} from "@caiae/rules";
import {
  federalDataEncryptionRuleSet,
} from "@federal-encryption/policy";
import {
  FederalEncryptionEvaluator,
  fullyCompliantSystem,
} from "../src/index.js";

const ORG =
  "11111111-1111-4111-8111-111111111111";
const RESOURCE =
  "22222222-2222-4222-8222-222222222222";
const CHECK =
  "33333333-3333-4333-8333-333333333333";
const RULESET =
  "44444444-4444-4444-8444-444444444444";

test("simulation workflow creates resource, submits evidence, and evaluates ad hoc draft rules", async () => {
  const calls:
    Array<{
      url: string;
      method: string;
      body: any;
    }> = [];
  const expectedEvaluation =
    evaluateRuleSet(
      federalDataEncryptionRuleSet,
      {
        resource: {
          resourceType:
            fullyCompliantSystem
              .resource
              .resourceType,
          attributes:
            fullyCompliantSystem
              .resource
              .attributes,
        },
        evidenceTypes:
          fullyCompliantSystem
            .evidence
            .map(
              (item) =>
                item.evidenceType,
            ),
      },
    );

  const evaluator =
    new FederalEncryptionEvaluator({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl:
        mockFetch(
          calls,
          expectedEvaluation,
        ),
    });

  const output =
    await evaluator
      .evaluateFixture(
        fullyCompliantSystem,
        {
          evaluationMode: {
            mode:
              "simulation",
          },
        },
      );

  assert.equal(
    output.result
      .evaluation.status,
    "pass",
  );
  assert.equal(
    output.evidence.length,
    fullyCompliantSystem
      .evidence.length,
  );

  const checkCall =
    calls.find(
      (call) =>
        call.url.endsWith(
          "/v1/checks/run",
        ),
    );
  assert.ok(checkCall);
  assert.equal(
    checkCall.body
      .registeredRuleSetId,
    undefined,
  );
  assert.equal(
    checkCall.body
      .ruleSet.id,
    "federal-data-encryption-act",
  );
  assert.equal(
    checkCall.body
      .metadata
      .federalEncryption
      .legalStatus,
    "draft-simulation",
  );

  const evidenceCalls =
    calls.filter(
      (call) =>
        call.url.endsWith(
          "/v1/evidence",
        ),
    );
  assert.equal(
    evidenceCalls.length,
    fullyCompliantSystem
      .evidence.length,
  );
});

test("registered mode sends only the registered ruleset id", async () => {
  const calls:
    Array<{
      url: string;
      method: string;
      body: any;
    }> = [];
  const evaluation =
    evaluateRuleSet(
      federalDataEncryptionRuleSet,
      {
        resource: {
          resourceType:
            fullyCompliantSystem
              .resource
              .resourceType,
          attributes:
            fullyCompliantSystem
              .resource
              .attributes,
        },
        evidenceTypes:
          fullyCompliantSystem
            .evidence
            .map(
              (item) =>
                item.evidenceType,
            ),
      },
    );
  const evaluator =
    new FederalEncryptionEvaluator({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl:
        mockFetch(
          calls,
          evaluation,
        ),
    });

  await evaluator
    .evaluateResource({
      resourceId:
        RESOURCE,
      evaluationMode: {
        mode:
          "registered",
        registeredRuleSetId:
          RULESET,
      },
    });

  const call =
    calls.find(
      (item) =>
        item.url.endsWith(
          "/v1/checks/run",
        ),
    );
  assert.ok(call);
  assert.equal(
    call.body
      .registeredRuleSetId,
    RULESET,
  );
  assert.equal(
    call.body.ruleSet,
    undefined,
  );
  assert.equal(
    call.body
      .metadata
      .federalEncryption
      .legalStatus,
    "registered-effective-ruleset",
  );
});

test("finding synchronization is opt-in", async () => {
  const calls:
    Array<{
      url: string;
      method: string;
      body: any;
    }> = [];
  const evaluation =
    evaluateRuleSet(
      federalDataEncryptionRuleSet,
      {
        resource: {
          resourceType:
            fullyCompliantSystem
              .resource
              .resourceType,
          attributes:
            fullyCompliantSystem
              .resource
              .attributes,
        },
        evidenceTypes:
          fullyCompliantSystem
            .evidence
            .map(
              (item) =>
                item.evidenceType,
            ),
      },
    );
  const evaluator =
    new FederalEncryptionEvaluator({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl:
        mockFetch(
          calls,
          evaluation,
        ),
    });

  const result =
    await evaluator
      .evaluateResource({
        resourceId:
          RESOURCE,
        evaluationMode: {
          mode:
            "simulation",
        },
        syncFindings:
          true,
      });

  assert.equal(
    result.findings.length,
    1,
  );
  assert.equal(
    calls.some(
      (call) =>
        call.url.endsWith(
          "/v1/checks/" +
            CHECK +
            "/findings/sync",
        ),
    ),
    true,
  );
});

function mockFetch(
  calls:
    Array<{
      url: string;
      method: string;
      body: any;
    }>,
  evaluation: unknown,
): typeof fetch {
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
      url.endsWith(
        "/v1/resources",
      )
    ) {
      return json(
        {
          id: RESOURCE,
          organizationId:
            ORG,
          resourceType:
            fullyCompliantSystem
              .resource
              .resourceType,
          name:
            fullyCompliantSystem
              .resource.name,
          externalRef:
            fullyCompliantSystem
              .resource
              .externalRef,
          status: "active",
          attributes:
            fullyCompliantSystem
              .resource
              .attributes,
          metadata: {},
        },
        201,
      );
    }

    if (
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
        },
        201,
      );
    }

    if (
      url.endsWith(
        "/v1/checks/run",
      )
    ) {
      return json(
        {
          check: {
            id: CHECK,
            organizationId:
              ORG,
            resourceId:
              RESOURCE,
            status:
              "completed",
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

    if (
      url.endsWith(
        "/v1/checks/" +
          CHECK +
          "/findings/sync",
      )
    ) {
      return json({
        findings: [
          {
            id:
              "finding-1",
          },
        ],
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
