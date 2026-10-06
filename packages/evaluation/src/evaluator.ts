import {
  createOperatorClient,
  type ComplianceEngineClient,
  type JsonObject,
} from "@caiae/sdk";
import {
  federalDataEncryptionRuleSet,
} from "@federal-encryption/policy";
import {
  parseEvaluation,
} from "./parse.js";
import type {
  EvaluateResourceOptions,
  FederalEvaluationResult,
  FederalEvidenceFixture,
  FederalResourceFixture,
} from "./types.js";

export type FederalEncryptionEvaluatorOptions = {
  baseUrl: string;
  organizationId: string;
  operatorToken: string;
  fetchImpl?: typeof fetch;
};

export class FederalEncryptionEvaluator {
  private readonly client:
    ComplianceEngineClient;

  constructor(
    private readonly options:
      FederalEncryptionEvaluatorOptions,
  ) {
    this.client =
      createOperatorClient({
        baseUrl:
          options.baseUrl,
        organizationId:
          options.organizationId,
        token:
          options.operatorToken,
        transport:
          options.fetchImpl
            ? {
                fetchImpl:
                  options.fetchImpl,
              }
            : undefined,
      });
  }

  async createFixtureResource(
    fixture:
      FederalResourceFixture,
  ) {
    return this.client.createResource({
      resourceType:
        fixture.resource.resourceType,
      name:
        fixture.resource.name,
      externalRef:
        fixture.resource.externalRef,
      attributes:
        fixture.resource.attributes,
      metadata: {
        federalEncryption: {
          fixtureId:
            fixture.id,
          fixtureExpectedStatus:
            fixture.expectedStatus,
        },
      },
    });
  }

  async submitFixtureEvidence(
    resourceId: string,
    evidence:
      readonly FederalEvidenceFixture[],
  ): Promise<
    Array<
      Record<string, unknown>
    >
  > {
    const records:
      Array<
        Record<string, unknown>
      > = [];

    for (
      const item of evidence
    ) {
      const response =
        await this.client.request<
          Record<string, unknown>
        >(
          "/v1/evidence",
          {
            method: "POST",
            body: {
              organizationId:
                this.options
                  .organizationId,
              resourceId,
              evidenceType:
                item.evidenceType,
              title:
                item.title,
              source:
                "federal-encryption-compliance-fixture",
              capturedAt:
                capturedAt(
                  item.attributes,
                ),
              attributes:
                item.attributes,
              metadata: {
                federalEncryption: {
                  policyFamily:
                    "federal-data-encryption-act",
                },
              },
            },
          },
        );

      records.push(
        response.data,
      );
    }

    return records;
  }

  async evaluateResource(
    input:
      EvaluateResourceOptions,
  ): Promise<
    FederalEvaluationResult
  > {
    const metadata:
      JsonObject = {
        federalEncryption: {
          policyFamily:
            "federal-data-encryption-act",
          evaluationMode:
            input.evaluationMode.mode,
          legalStatus:
            input.evaluationMode.mode ===
            "simulation"
              ? "draft-simulation"
              : "registered-effective-ruleset",
        },
      };

    const common = {
      resourceId:
        input.resourceId,
      requestedByPrincipalId:
        input
          .requestedByPrincipalId,
      evaluatedAt:
        input.evaluatedAt,
      correlationId:
        input.correlationId,
      metadata,
    };

    const result =
      input.evaluationMode.mode ===
      "simulation"
        ? await this.client.runCheck({
            ...common,
            ruleSet:
              federalDataEncryptionRuleSet,
          })
        : await this.client.runCheck({
            ...common,
            registeredRuleSetId:
              input.evaluationMode
                .registeredRuleSetId,
          });

    const findings =
      input.syncFindings
        ? await this.syncFindings(
            result.check.id,
            input.correlationId,
          )
        : [];

    return {
      checkId:
        result.check.id,
      checkStatus:
        result.check.status,
      registrationMode:
        typeof result.check
          .registrationMode ===
        "string"
          ? result.check
              .registrationMode
          : null,
      evaluation:
        parseEvaluation(
          result.evaluation,
        ),
      findings,
    };
  }

  async evaluateFixture(
    fixture:
      FederalResourceFixture,
    options: Omit<
      EvaluateResourceOptions,
      "resourceId"
    >,
  ): Promise<{
    resource:
      Record<string, unknown>;
    evidence:
      Array<
        Record<string, unknown>
      >;
    result:
      FederalEvaluationResult;
  }> {
    const resource =
      await this.createFixtureResource(
        fixture,
      );
    const resourceId =
      requiredResourceId(
        resource,
      );
    const evidence =
      await this.submitFixtureEvidence(
        resourceId,
        fixture.evidence,
      );
    const result =
      await this.evaluateResource({
        ...options,
        resourceId,
      });

    return {
      resource:
        resource as unknown as
          Record<string, unknown>,
      evidence,
      result,
    };
  }

  private async syncFindings(
    checkId: string,
    correlationId?:
      string | null,
  ): Promise<
    Array<
      Record<string, unknown>
    >
  > {
    const response =
      await this.client.request<{
        findings:
          Array<
            Record<
              string,
              unknown
            >
          >;
      }>(
        "/v1/checks/" +
          encodeURIComponent(
            checkId,
          ) +
          "/findings/sync",
        {
          method: "POST",
          body: {
            correlationId:
              correlationId ??
              null,
          },
        },
      );

    return response.data
      .findings;
  }
}

function capturedAt(
  attributes:
    JsonObject,
): string | null {
  const value =
    attributes.observedAt;

  return typeof value ===
    "string"
    ? value
    : null;
}

function requiredResourceId(
  resource: {
    id?: unknown;
  },
): string {
  if (
    typeof resource.id !==
      "string" ||
    resource.id.trim() ===
      ""
  ) {
    throw new Error(
      "created resource is missing id",
    );
  }
  return resource.id;
}
