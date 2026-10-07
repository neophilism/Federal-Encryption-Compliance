export type ComplianceExportFormat =
  | "json"
  | "csv"
  | "text";

export function parseComplianceExportFormat(
  value: string | null,
): ComplianceExportFormat {
  if (
    value === null ||
    value === ""
  ) {
    return "json";
  }

  if (
    value === "json" ||
    value === "csv" ||
    value === "text"
  ) {
    return value;
  }

  throw new Error(
    "format must be json, csv, or text",
  );
}

export function complianceExportFilename(
  format:
    ComplianceExportFormat,
  resourceId?: string | null,
): string {
  const suffix =
    resourceId
      ? "-" +
        resourceId.replace(
          /[^a-zA-Z0-9_-]+/g,
          "-",
        )
      : "";
  const extension =
    format === "text"
      ? "txt"
      : format;

  return (
    "federal-encryption-compliance" +
    suffix +
    "." +
    extension
  );
}
