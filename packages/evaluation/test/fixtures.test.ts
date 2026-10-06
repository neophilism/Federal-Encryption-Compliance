import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateRuleSet,
} from "@caiae/rules";
import {
  federalDataEncryptionRuleSet,
} from "@federal-encryption/policy";
import {
  evaluationFixtures,
  failingSystem,
  fullyCompliantSystem,
  incompleteEvidenceSystem,
  nonCoveredSystem,
} from "../src/index.js";

for (
  const fixture of
  evaluationFixtures
) {
  test(
    "fixture " +
      fixture.id +
      " matches expected upstream evaluation status",
    () => {
      const result =
        evaluateRuleSet(
          federalDataEncryptionRuleSet,
          {
            resource: {
              resourceType:
                fixture.resource
                  .resourceType,
              attributes:
                fixture.resource
                  .attributes,
            },
            evidenceTypes:
              fixture.evidence.map(
                (item) =>
                  item.evidenceType,
              ),
          },
        );

      assert.equal(
        result.status,
        fixture.expectedStatus,
      );
    },
  );
}

test("fully compliant covered system passes every applicable system control", () => {
  const result =
    evaluateFixture(
      fullyCompliantSystem,
    );

  assert.equal(
    result.counts.pass,
    8,
  );
  assert.equal(
    result.counts.fail,
    0,
  );
  assert.equal(
    result.counts.unknown,
    0,
  );
  assert.equal(
    result.counts.notApplicable,
    6,
  );
});

test("failing covered system produces concrete failures rather than unknown results", () => {
  const result =
    evaluateFixture(
      failingSystem,
    );

  assert.equal(
    result.counts.fail,
    8,
  );
  assert.equal(
    result.counts.unknown,
    0,
  );
  assert.equal(
    result.counts.notApplicable,
    6,
  );
});

test("missing evidence produces unknown results even when attributes claim compliance", () => {
  const result =
    evaluateFixture(
      incompleteEvidenceSystem,
    );

  assert.equal(
    result.counts.pass,
    0,
  );
  assert.equal(
    result.counts.fail,
    0,
  );
  assert.equal(
    result.counts.unknown,
    8,
  );
  assert.equal(
    result.counts.notApplicable,
    6,
  );
});

test("non-covered information system has no applicable modeled controls", () => {
  const result =
    evaluateFixture(
      nonCoveredSystem,
    );

  assert.equal(
    result.status,
    "pass",
  );
  assert.equal(
    result.counts.notApplicable,
    14,
  );
});

function evaluateFixture(
  fixture:
    typeof evaluationFixtures[number],
) {
  return evaluateRuleSet(
    federalDataEncryptionRuleSet,
    {
      resource: {
        resourceType:
          fixture.resource
            .resourceType,
        attributes:
          fixture.resource
            .attributes,
      },
      evidenceTypes:
        fixture.evidence.map(
          (item) =>
            item.evidenceType,
        ),
    },
  );
}
