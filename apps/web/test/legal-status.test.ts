import assert from "node:assert/strict";
import test from "node:test";
import {
  readFederalLegalStatus,
} from "../lib/legal-status";

test("legal status defaults to draft simulation", () => {
  const status =
    readFederalLegalStatus(
      {},
    );

  assert.equal(
    status.mode,
    "draft",
  );
  assert.equal(
    status.effectiveFrom,
    null,
  );
});

test("partial or invalid enactment configuration remains fail closed", () => {
  assert.equal(
    readFederalLegalStatus({
      FDEA_EFFECTIVE_FROM:
        "2026-10-07T12:00:00-04:00",
    }).mode,
    "incomplete-enactment",
  );

  assert.equal(
    readFederalLegalStatus({
      FDEA_EFFECTIVE_FROM:
        "not-a-date",
      FDEA_ENACTMENT_REFERENCE:
        "Public Law reference",
    }).mode,
    "incomplete-enactment",
  );

  assert.equal(
    readFederalLegalStatus({
      FDEA_ENACTMENT_REFERENCE:
        "Public Law reference",
    }).mode,
    "incomplete-enactment",
  );
});

test("legal status becomes enacted only with timestamp and authority reference", () => {
  const status =
    readFederalLegalStatus({
      FDEA_EFFECTIVE_FROM:
        "2026-10-07T16:00:00Z",
      FDEA_ENACTMENT_REFERENCE:
        "Public Law 999-999",
    });

  assert.equal(
    status.mode,
    "enacted",
  );

  if (
    status.mode ===
      "enacted"
  ) {
    assert.equal(
      status.effectiveFrom,
      "2026-10-07T16:00:00.000Z",
    );
    assert.equal(
      status.enactmentReference,
      "Public Law 999-999",
    );
  }
});
