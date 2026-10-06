import assert from "node:assert/strict";
import test from "node:test";
import {
  buildThinAppConfig,
} from "../lib/config";

test("thin app config validates through @caiae/sdk", () => {
  const config =
    buildThinAppConfig({});

  assert.equal(
    config.schemaVersion,
    "1",
  );
  assert.equal(
    config.appId,
    "federal-encryption-compliance",
  );
  assert.equal(
    config.engine.apiBaseUrl,
    "http://localhost:4000",
  );
  assert.equal(
    config.resourceTypes
      ?.["federal-agency"]
      ?.label,
    "Federal Agency",
  );
});

test("environment can bind engine endpoint and organization without changing policy config", () => {
  const organizationId =
    "11111111-1111-4111-8111-111111111111";
  const config =
    buildThinAppConfig({
      CAIAE_API_BASE_URL:
        "https://engine.example.gov/",
      CAIAE_ORGANIZATION_ID:
        organizationId,
    });

  assert.equal(
    config.engine.apiBaseUrl,
    "https://engine.example.gov",
  );
  assert.equal(
    config.engine.organizationId,
    organizationId,
  );
});

test("invalid organization binding is rejected by the upstream SDK", () => {
  assert.throws(
    () =>
      buildThinAppConfig({
        CAIAE_ORGANIZATION_ID:
          "not-a-uuid",
      }),
    /UUID/,
  );
});
