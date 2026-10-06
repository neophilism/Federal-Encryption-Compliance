import {
  FederalEncryptionEvaluator,
} from "./evaluator.js";
import {
  getEvaluationFixture,
} from "./fixtures.js";
import type {
  EvaluationMode,
} from "./types.js";

function required(
  name: string,
): string {
  const value =
    process.env[name]
      ?.trim();

  if (!value) {
    throw new Error(
      name + " is required",
    );
  }

  return value;
}

function booleanEnv(
  name: string,
): boolean {
  const value =
    process.env[name]
      ?.trim()
      .toLowerCase();

  if (!value) {
    return false;
  }

  if (
    value === "true" ||
    value === "1" ||
    value === "yes"
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === "0" ||
    value === "no"
  ) {
    return false;
  }

  throw new Error(
    name +
      " must be true or false",
  );
}

function evaluationMode():
  EvaluationMode {
  const mode =
    process.env
      .FDEA_EVALUATION_MODE
      ?.trim()
      .toLowerCase() ??
    "simulation";

  if (
    mode === "simulation"
  ) {
    return {
      mode:
        "simulation",
    };
  }

  if (
    mode === "registered"
  ) {
    return {
      mode:
        "registered",
      registeredRuleSetId:
        required(
          "FDEA_REGISTERED_RULESET_ID",
        ),
    };
  }

  throw new Error(
    "FDEA_EVALUATION_MODE must be simulation or registered",
  );
}

const fixture =
  getEvaluationFixture(
    process.env
      .FDEA_FIXTURE
      ?.trim() ||
      "fully-compliant-system",
  );

const evaluator =
  new FederalEncryptionEvaluator({
    baseUrl:
      required(
        "CAIAE_API_BASE_URL",
      ),
    organizationId:
      required(
        "CAIAE_ORGANIZATION_ID",
      ),
    operatorToken:
      required(
        "CAIAE_OPERATOR_TOKEN",
      ),
  });

const output =
  await evaluator
    .evaluateFixture(
      fixture,
      {
        evaluationMode:
          evaluationMode(),
        requestedByPrincipalId:
          process.env
            .CAIAE_PRINCIPAL_ID
            ?.trim() ||
          null,
        evaluatedAt:
          process.env
            .FDEA_EVALUATED_AT
            ?.trim() ||
          undefined,
        syncFindings:
          booleanEnv(
            "FDEA_SYNC_FINDINGS",
          ),
      },
    );

process.stdout.write(
  JSON.stringify(
    {
      fixture: {
        id:
          fixture.id,
        expectedStatus:
          fixture.expectedStatus,
      },
      resource:
        output.resource,
      evidenceCount:
        output.evidence
          .length,
      evaluation:
        output.result,
    },
    null,
    2,
  ) + "\n",
);
