import assert from "node:assert/strict";
import test from "node:test";
import {
  complianceExportFilename,
  complianceReportPath,
  parseComplianceExportFormat,
} from "../lib/report-export";

test("report export format is strict and defaults to json", () => {
  assert.equal(
    parseComplianceExportFormat(
      null,
    ),
    "json",
  );
  assert.equal(
    parseComplianceExportFormat(
      "csv",
    ),
    "csv",
  );
  assert.throws(
    () =>
      parseComplianceExportFormat(
        "pdf",
      ),
    /json, csv, or text/,
  );
});

test("report path encodes resource identifiers", () => {
  assert.equal(
    complianceReportPath(
      "org-id",
      "resource/with space",
    ),
    "/v1/reports/organizations/org-id/resources/resource%2Fwith%20space/compliance",
  );
});

test("export filenames are safe", () => {
  assert.equal(
    complianceExportFilename(
      "text",
      "resource/1",
    ),
    "federal-encryption-compliance-resource-1.txt",
  );
});
