import assert from "node:assert/strict";
import test from "node:test";
import {
  createOperatorEngineClient,
  readOperatorReadiness,
} from "../lib/operator";

test("operator readiness fails closed when organization and credential are absent", () => {
  const readiness =
    readOperatorReadiness({
      CAIAE_API_BASE_URL:
        "https://engine.example.gov",
    });

  assert.equal(
    readiness.configured,
    false,
  );
  assert.deepEqual(
    readiness.missing,
    [
      "CAIAE_ORGANIZATION_ID",
      "CAIAE_OPERATOR_TOKEN",
    ],
  );
  assert.equal(
    readiness.organizationId,
    null,
  );
});

test("operator readiness never returns the operator credential", () => {
  const readiness =
    readOperatorReadiness({
      CAIAE_API_BASE_URL:
        "https://engine.example.gov",
      CAIAE_ORGANIZATION_ID:
        "11111111-1111-4111-8111-111111111111",
      CAIAE_OPERATOR_TOKEN:
        "caiau_secret-value",
    });

  assert.equal(
    readiness.configured,
    true,
  );
  assert.equal(
    JSON.stringify(
      readiness,
    ).includes(
      "caiau_secret-value",
    ),
    false,
  );
});

test("operator client retains upstream token-family validation", () => {
  assert.throws(
    () =>
      createOperatorEngineClient({
        CAIAE_API_BASE_URL:
          "https://engine.example.gov",
        CAIAE_ORGANIZATION_ID:
          "11111111-1111-4111-8111-111111111111",
        CAIAE_OPERATOR_TOKEN:
          "wrong_family",
      }),
    /caiau_/,
  );
});
