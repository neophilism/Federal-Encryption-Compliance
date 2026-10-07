import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFederalDemoDashboard,
  FEDERAL_DEMO_RESOURCE_IDS,
  renderFederalDemoReport,
} from "../lib/demo";
import {
  isFederalDemoMode,
} from "../lib/demo-mode";

test("demo mode is explicit and opt-in", () => {
  assert.equal(
    isFederalDemoMode({}),
    false,
  );
  assert.equal(
    isFederalDemoMode({
      FDEA_DEMO_MODE: "true",
    }),
    true,
  );
  assert.equal(
    isFederalDemoMode({
      FDEA_DEMO_MODE: "ON",
    }),
    true,
  );
});

test("full fictional demo covers the dashboard lifecycle", () => {
  const data =
    buildFederalDemoDashboard();

  assert.ok(data);
  assert.equal(
    data.organization.name,
    "Example Federal Agency",
  );
  assert.ok(
    data.resources.length >= 5,
  );
  assert.ok(
    data.deadlines.some(
      (item) =>
        item.effectiveStatus ===
        "overdue",
    ),
  );
  assert.ok(
    data.findings.length >= 3,
  );
  assert.ok(
    data.remediations.length >= 2,
  );
  assert.ok(
    data.certifications.some(
      (item) => item.valid,
    ),
  );
  assert.ok(
    data.filings.length >= 2,
  );
  assert.equal(
    data.audit.allChainsValid,
    true,
  );
});

test("resource drill-down and exports work in demo mode", () => {
  const resource =
    buildFederalDemoDashboard(
      FEDERAL_DEMO_RESOURCE_IDS
        .legacy,
    );

  assert.ok(resource);
  assert.equal(
    resource.resources.length,
    1,
  );
  assert.equal(
    resource.resources[0].id,
    FEDERAL_DEMO_RESOURCE_IDS
      .legacy,
  );
  assert.ok(
    resource.findings.length > 0,
  );

  for (
    const format of [
      "json",
      "csv",
      "text",
    ] as const
  ) {
    const report =
      renderFederalDemoReport(
        format,
        FEDERAL_DEMO_RESOURCE_IDS
          .legacy,
      );
    assert.ok(report);
    assert.ok(
      report.body.length > 0,
    );
  }
});

test("unknown fictional resource fails closed", () => {
  assert.equal(
    buildFederalDemoDashboard(
      "not-a-demo-resource",
    ),
    null,
  );
  assert.equal(
    renderFederalDemoReport(
      "json",
      "not-a-demo-resource",
    ),
    null,
  );
});
