import type {
  EvaluationRuleResult,
  ParsedEvaluation,
} from "./types.js";

export function parseEvaluation(
  input: unknown,
): ParsedEvaluation {
  const source =
    object(input, "evaluation");
  const counts =
    object(
      source.counts,
      "evaluation.counts",
    );
  const rules =
    array(
      source.rules,
      "evaluation.rules",
    ).map<EvaluationRuleResult>(
      (item, index) => {
        const rule =
          object(
            item,
            "evaluation.rules[" +
              index +
              "]",
          );
        const status =
          string(
            rule.status,
            "rule.status",
          );

        if (
          status !== "pass" &&
          status !== "fail" &&
          status !== "unknown" &&
          status !==
            "not_applicable"
        ) {
          throw new Error(
            "rule.status is invalid",
          );
        }

        return {
          ruleId:
            string(
              rule.ruleId,
              "rule.ruleId",
            ),
          status,
          severity:
            string(
              rule.severity,
              "rule.severity",
            ),
          missingEvidenceTypes:
            stringArray(
              rule.missingEvidenceTypes,
              "rule.missingEvidenceTypes",
            ),
        };
      },
    );

  const status =
    string(
      source.status,
      "evaluation.status",
    );

  if (
    status !== "pass" &&
    status !== "fail" &&
    status !== "unknown"
  ) {
    throw new Error(
      "evaluation.status is invalid",
    );
  }

  return {
    ruleSetId:
      string(
        source.ruleSetId,
        "evaluation.ruleSetId",
      ),
    version:
      string(
        source.version,
        "evaluation.version",
      ),
    status,
    counts: {
      pass:
        integer(
          counts.pass,
          "counts.pass",
        ),
      fail:
        integer(
          counts.fail,
          "counts.fail",
        ),
      unknown:
        integer(
          counts.unknown,
          "counts.unknown",
        ),
      notApplicable:
        integer(
          counts.notApplicable,
          "counts.notApplicable",
        ),
    },
    rules,
  };
}

function object(
  value: unknown,
  path: string,
): Record<string, unknown> {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      path + " must be an object",
    );
  }
  return value as Record<
    string,
    unknown
  >;
}

function array(
  value: unknown,
  path: string,
): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(
      path + " must be an array",
    );
  }
  return value;
}

function string(
  value: unknown,
  path: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new Error(
      path +
        " must be a non-empty string",
    );
  }
  return value;
}

function integer(
  value: unknown,
  path: string,
): number {
  if (
    !Number.isSafeInteger(value) ||
    Number(value) < 0
  ) {
    throw new Error(
      path +
        " must be a non-negative integer",
    );
  }
  return Number(value);
}

function stringArray(
  value: unknown,
  path: string,
): string[] {
  return array(
    value,
    path,
  ).map(
    (item, index) =>
      string(
        item,
        path +
          "[" +
          index +
          "]",
      ),
  );
}
