import assert from "node:assert/strict";
import test from "node:test";
import {
  complianceExportFilename,
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

test("export filenames are safe", () => {
  assert.equal(
    complianceExportFilename(
      "text",
      "resource/1",
    ),
    "federal-encryption-compliance-resource-1.txt",
  );
});
