import {
  createOperatorClient,
  type ComplianceEngineClient,
  type EvidenceView,
  type JsonObject,
  type Resource,
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
  ): Promise<EvidenceView[]> {
    const records:
      EvidenceView[] = [];

    for (
      const item of evidence
    ) {
      const record =
        await this.client
          .createEvidence({
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
          });

      records.push(
        record,
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
        ? (
            await this.client
              .syncFailedCheckFindings(
                result.check.id,
                input.correlationId,
              )
          ).findings
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
    resource: Resource;
    evidence: EvidenceView[];
    result:
      FederalEvaluationResult;
  }> {
    const resource =
      await this.createFixtureResource(
        fixture,
      );
    const resourceId =
      resource.id;
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
      resource,
      evidence,
      result,
    };
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

