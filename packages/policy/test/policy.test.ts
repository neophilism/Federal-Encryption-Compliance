import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRuleSetRegistrationBody,
  evidenceSchemas,
  federalDataEncryptionAuthorities,
  federalDataEncryptionRuleSet,
  provisionFederalDataEncryptionPolicy,
  resourceSchemas,
} from "../src/index.js";

const ORG =
  "11111111-1111-4111-8111-111111111111";
const POLICY =
  "22222222-2222-4222-8222-222222222222";
const RULESET =
  "33333333-3333-4333-8333-333333333333";

test("policy bundle has unique rule ids and traceable authorities", () => {
  const ids =
    federalDataEncryptionRuleSet.rules.map(
      (rule) => rule.id,
    );

  assert.equal(
    new Set(ids).size,
    ids.length,
  );
  assert.equal(
    ids.length,
    12,
  );
  assert.equal(
    federalDataEncryptionAuthorities.length,
    6,
  );

  for (
    const rule of
    federalDataEncryptionRuleSet.rules
  ) {
    assert.equal(
      typeof rule.metadata
        ?.authorityCitation,
      "string",
    );
    assert.equal(
      typeof rule.metadata
        ?.authorityLocator,
      "string",
    );
  }
});

test("resource and evidence schema inventory covers every ruleset evidence type", () => {
  assert.deepEqual(
    Object.keys(
      resourceSchemas,
    ).sort(),
    [
      "covered-contractor",
      "external-service",
      "federal-agency",
      "information-system",
    ],
  );

  const requiredEvidence =
    new Set(
      federalDataEncryptionRuleSet.rules.flatMap(
        (rule) =>
          rule.requiredEvidenceTypes ??
          [],
      ),
    );

  for (
    const evidenceType of
    requiredEvidence
  ) {
    assert.ok(
      evidenceType in
        evidenceSchemas,
      "missing schema for " +
        evidenceType,
    );
  }

  for (
    const schema of
    Object.values(
      resourceSchemas,
    )
  ) {
    assert.equal(
      schema.$schema,
      "https://json-schema.org/draft/2020-12/schema",
    );
    assert.equal(
      schema.additionalProperties,
      false,
    );
  }
});

test("registration body is draft legislation with section-level authority links", () => {
  const body =
    buildRuleSetRegistrationBody(
      ORG,
      POLICY,
    );

  assert.equal(
    body.organizationId,
    ORG,
  );
  assert.equal(
    body.policyId,
    POLICY,
  );
  assert.equal(
    body.key,
    "federal-data-encryption-act",
  );
  assert.equal(
    body.ruleSet.version,
    "2025-draft-1",
  );
  assert.equal(
    body.metadata.sourceStatus,
    "draft",
  );
  assert.deepEqual(
    body.authorities.map(
      (authority) =>
        authority.locator,
    ),
    [
      "Sec. 3",
      "Sec. 4",
      "Sec. 5",
      "Sec. 6",
      "Sec. 7",
      "Sec. 11",
    ],
  );
});

test("provisioning leaves the ruleset draft unless an effective date is explicitly supplied", async () => {
  const calls:
    Array<{
      url: string;
      body: any;
    }> = [];

  const fetchImpl:
    typeof fetch =
    async (input, init) => {
      const url =
        String(input);
      const body =
        init?.body
          ? JSON.parse(
              String(init.body),
            )
          : null;
      calls.push({
        url,
        body,
      });

      if (
        url.endsWith(
          "/v1/policies",
        )
      ) {
        return json({
          id: POLICY,
        }, 201);
      }

      if (
        url.endsWith(
          "/v1/rulesets",
        )
      ) {
        return json({
          id: RULESET,
          status: "draft",
          effectiveFrom: null,
        }, 201);
      }

      throw new Error(
        "unexpected request: " +
          url,
      );
    };

  const result =
    await provisionFederalDataEncryptionPolicy({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      fetchImpl,
    });

  assert.equal(
    result.ruleSetStatus,
    "draft",
  );
  assert.equal(
    result.effectiveFrom,
    null,
  );
  assert.equal(
    calls.length,
    2,
  );
  assert.equal(
    calls.some(
      (call) =>
        call.url.includes(
          "/activate",
        ),
    ),
    false,
  );
});

test("provisioning activates only when an explicit enactment/effective timestamp is supplied", async () => {
  const calls: string[] = [];
  const effectiveFrom =
    "2027-01-15T12:00:00.000Z";

  const fetchImpl:
    typeof fetch =
    async (input) => {
      const url =
        String(input);
      calls.push(url);

      if (
        url.endsWith(
          "/v1/rulesets",
        )
      ) {
        return json({
          id: RULESET,
          status: "draft",
          effectiveFrom: null,
        }, 201);
      }

      if (
        url.endsWith(
          "/v1/rulesets/" +
            RULESET +
            "/activate",
        )
      ) {
        return json({
          id: RULESET,
          status: "active",
          effectiveFrom,
        });
      }

      throw new Error(
        "unexpected request: " +
          url,
      );
    };

  const result =
    await provisionFederalDataEncryptionPolicy({
      baseUrl:
        "https://engine.example.gov",
      organizationId: ORG,
      operatorToken:
        "caiau_test_operator",
      existingPolicyId:
        POLICY,
      effectiveFrom,
      fetchImpl,
    });

  assert.equal(
    result.ruleSetStatus,
    "active",
  );
  assert.equal(
    result.effectiveFrom,
    effectiveFrom,
  );
  assert.equal(
    calls.length,
    2,
  );
  assert.match(
    calls[1]!,
    /\/activate$/,
  );
});

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
