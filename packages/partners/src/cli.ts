import {
  FederalEncryptionEvaluator,
} from "@federal-encryption/evaluation";
import type {
  EvaluationMode,
} from "@federal-encryption/evaluation";
import {
  getPartnerFixture,
} from "./fixtures.js";

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
  getPartnerFixture(
    process.env
      .FDEA_PARTNER_FIXTURE
      ?.trim() ||
      "compliant-covered-contractor",
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
        syncFindings:
          process.env
            .FDEA_SYNC_FINDINGS ===
          "true",
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
