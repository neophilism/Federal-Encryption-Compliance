import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateStatutoryEnactmentDates,
  nextQuarterlyUpdateDueAt,
  validateAnnualDueAt,
} from "../src/index.js";

test("enactment clocks preserve the statute's day, year, and month semantics", () => {
  const dates =
    calculateStatutoryEnactmentDates(
      "2026-01-01T00:00:00.000Z",
    );

  assert.deepEqual(
    dates,
    {
      nistGuidanceDueAt:
        "2026-06-30T00:00:00.000Z",
      agencyImplementationDueAt:
        "2027-01-01T00:00:00.000Z",
      existingContractTransitionDueAt:
        "2027-01-01T00:00:00.000Z",
      gaoEvaluationDueAt:
        "2027-07-01T00:00:00.000Z",
    },
  );
});

test("calendar periods clamp end-of-month instead of pretending a year or quarter is a fixed number of days", () => {
  const leap =
    calculateStatutoryEnactmentDates(
      "2028-02-29T12:30:00.000Z",
    );

  assert.equal(
    leap.agencyImplementationDueAt,
    "2029-02-28T12:30:00.000Z",
  );
  assert.equal(
    nextQuarterlyUpdateDueAt(
      "2027-01-31T09:15:00.000Z",
    ),
    "2027-04-30T09:15:00.000Z",
  );
});

test("annual certification requires an OMB-selected date inside the stated reporting year", () => {
  assert.equal(
    validateAnnualDueAt(
      "2028-12-31T23:59:59.000Z",
      2028,
    ),
    "2028-12-31T23:59:59.000Z",
  );

  assert.throws(
    () =>
      validateAnnualDueAt(
        "2029-01-01T00:00:00.000Z",
        2028,
      ),
    /reportingYear/,
  );
});

test("invalid or absent enactment dates fail closed", () => {
  assert.throws(
    () =>
      calculateStatutoryEnactmentDates(
        "",
      ),
    /enactmentAt is required/,
  );
  assert.throws(
    () =>
      calculateStatutoryEnactmentDates(
        "not-a-date",
      ),
    /valid date-time/,
  );
});
