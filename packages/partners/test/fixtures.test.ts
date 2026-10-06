import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateRuleSet,
} from "@caiae/rules";
import {
  federalDataEncryptionRuleSet,
} from "@federal-encryption/policy";
import {
  compliantCloudService,
  compliantContractor,
  compliantSharedService,
  failingCloudService,
  failingContractor,
  partnerFixtures,
} from "../src/index.js";

for (
  const fixture of
  partnerFixtures
) {
  test(
    "partner fixture " +
      fixture.id +
      " matches expected upstream evaluation status",
    () => {
      const result =
        evaluateFixture(
          fixture,
        );

      assert.equal(
        result.status,
        fixture.expectedStatus,
      );
    },
  );
}

test("compliant contractor passes five applicable Section 5 controls", () => {
  const result =
    evaluateFixture(
      compliantContractor,
    );

  assert.equal(
    result.counts.pass,
    5,
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
    12,
  );
});

test("failing contractor fails five applicable controls with evidence present", () => {
  const result =
    evaluateFixture(
      failingContractor,
    );

  assert.equal(
    result.counts.fail,
    5,
  );
  assert.equal(
    result.counts.unknown,
    0,
  );
  assert.equal(
    result.counts.notApplicable,
    12,
  );
});

test("compliant cloud service passes four applicable external-system controls", () => {
  const result =
    evaluateFixture(
      compliantCloudService,
    );

  assert.equal(
    result.counts.pass,
    4,
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
    13,
  );
});

test("failing cloud service fails four applicable controls with evidence present", () => {
  const result =
    evaluateFixture(
      failingCloudService,
    );

  assert.equal(
    result.counts.fail,
    4,
  );
  assert.equal(
    result.counts.unknown,
    0,
  );
  assert.equal(
    result.counts.notApplicable,
    13,
  );
});

test("non-cloud shared service applies only the two general external-system controls", () => {
  const result =
    evaluateFixture(
      compliantSharedService,
    );

  assert.equal(
    result.counts.pass,
    2,
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
    15,
  );
});

function evaluateFixture(
  fixture:
    typeof partnerFixtures[number],
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
