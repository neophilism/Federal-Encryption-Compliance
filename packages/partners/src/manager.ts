import {
  createOperatorClient,
  type ComplianceEngineClient,
  type EvidenceView,
  type JsonObject,
  type Resource,
} from "@caiae/sdk";
import {
  FederalEncryptionEvaluator,
} from "@federal-encryption/evaluation";
import type {
  ContractClauseInput,
  ContractorPeriodicEvaluationInput,
  ContractorResourceInput,
  ExistingAgreementActionInput,
  ExternalServiceAgreementInput,
  ExternalServiceAssessmentInput,
  ExternalServiceResourceInput,
  PartnerEvaluationOptions,
  PartnerEvaluationResult,
  PartnerEvidenceResult,
  ResourceAttributePatch,
  SubcontractorFlowdownInput,
} from "./types.js";

export type PartnerComplianceManagerOptions = {
  baseUrl: string;
  organizationId: string;
  operatorToken: string;
  fetchImpl?: typeof fetch;
};

export class PartnerComplianceManager {
  private readonly client:
    ComplianceEngineClient;
  private readonly evaluator:
    FederalEncryptionEvaluator;

  constructor(
    private readonly options:
      PartnerComplianceManagerOptions,
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

    this.evaluator =
      new FederalEncryptionEvaluator({
        baseUrl:
          options.baseUrl,
        organizationId:
          options.organizationId,
        operatorToken:
          options.operatorToken,
        fetchImpl:
          options.fetchImpl,
      });
  }

  async createContractor(
    input:
      ContractorResourceInput,
  ): Promise<Resource> {
    return this.client
      .createResource({
        resourceType:
          "covered-contractor",
        name:
          input.name,
        externalRef:
          input.externalRef,
        attributes: {
          sponsoringAgencyExternalRef:
            input.sponsoringAgencyExternalRef,
          parentContractorExternalRef:
            input.parentContractorExternalRef ??
            null,
          handlesCoveredInformation:
            input.handlesCoveredInformation,
          arrangementType:
            input.arrangementType,
          agreementReference:
            input.agreementReference ??
            null,
          agreementLifecycle:
            input.agreementLifecycle,
          section4ControlsImplemented:
            input.section4ControlsImplemented,
          agreementMakesSection4ComplianceMaterialCondition:
            input.agreementMakesSection4ComplianceMaterialCondition,
          existingAgreementComplianceMandateIssued:
            input.existingAgreementComplianceMandateIssued ??
            null,
          existingAgreementComplianceAction:
            input.existingAgreementComplianceAction ??
            (
              input.agreementLifecycle ===
              "existing-at-enactment"
                ? "pending"
                : "not-applicable"
            ),
          usesSubcontractors:
            input.usesSubcontractors,
          subcontractorFlowdownAllTiersImplemented:
            input.subcontractorFlowdownAllTiersImplemented ??
            null,
          periodicComplianceEvaluationIncorporated:
            input.periodicComplianceEvaluationIncorporated,
          lastPeriodicEvaluationAt:
            input.lastPeriodicEvaluationAt ??
            null,
          complianceAuditCurrent:
            input.complianceAuditCurrent ??
            null,
        },
        metadata: {
          federalEncryption: {
            partnerKind:
              "covered-contractor",
          },
        },
      });
  }

  async createExternalService(
    input:
      ExternalServiceResourceInput,
  ): Promise<Resource> {
    return this.client
      .createResource({
        resourceType:
          "external-service",
        name:
          input.name,
        externalRef:
          input.externalRef,
        attributes: {
          sponsoringAgencyExternalRef:
            input.sponsoringAgencyExternalRef,
          serviceKind:
            input.serviceKind,
          agreementKind:
            input.agreementKind,
          agreementReference:
            input.agreementReference ??
            null,
          handlesCoveredInformation:
            input.handlesCoveredInformation,
          section4ControlsImplemented:
            input.section4ControlsImplemented,
          agreementRequiresSection4Compliance:
            input.agreementRequiresSection4Compliance,
          cloudDataEncrypted:
            input.cloudDataEncrypted ??
            null,
          keysPreventUnauthorizedProviderAccess:
            input.keysPreventUnauthorizedProviderAccess ??
            null,
          providerAccessExplicitlyPermittedByAgency:
            input.providerAccessExplicitlyPermittedByAgency ??
            null,
          permittedProviderAccessScope:
            input.permittedProviderAccessScope ??
            null,
        },
        metadata: {
          federalEncryption: {
            partnerKind:
              "external-service",
          },
        },
      });
  }

  async recordContractClause(
    resourceId: string,
    input:
      ContractClauseInput,
  ): Promise<PartnerEvidenceResult> {
    const resource =
      await this.updateAttributes(
        resourceId,
        {
          agreementReference:
            input.agreementReference,
          arrangementType:
            input.arrangementType,
          agreementMakesSection4ComplianceMaterialCondition:
            input.requiresSection4Compliance &&
            input.materialCondition,
        },
        input.correlationId,
        "covered-contractor",
      );

    const evidence =
      await this.createEvidence(
        resourceId,
        "fdea.contract-compliance-clause",
        "Contract compliance clause",
        {
          observedAt:
            input.observedAt,
          agreementReference:
            input.agreementReference,
          arrangementType:
            input.arrangementType,
          requiresSection4Compliance:
            input.requiresSection4Compliance,
          materialCondition:
            input.materialCondition,
        },
        input.correlationId,
      );

    return {
      resource,
      evidence,
    };
  }

  async recordSubcontractorFlowdown(
    resourceId: string,
    input:
      SubcontractorFlowdownInput,
  ): Promise<PartnerEvidenceResult> {
    const resource =
      await this.updateAttributes(
        resourceId,
        {
          usesSubcontractors:
            true,
          subcontractorFlowdownAllTiersImplemented:
            input.flowdownImplemented &&
            input.allTiersCovered,
        },
        input.correlationId,
        "covered-contractor",
      );

    const evidence =
      await this.createEvidence(
        resourceId,
        "fdea.subcontractor-flowdown",
        "Subcontractor flow-down verification",
        {
          observedAt:
            input.observedAt,
          flowdownImplemented:
            input.flowdownImplemented,
          allTiersCovered:
            input.allTiersCovered,
          agreementReferences:
            input.agreementReferences ??
            [],
        },
        input.correlationId,
      );

    return {
      resource,
      evidence,
    };
  }

  async recordExistingAgreementAction(
    resourceId: string,
    input:
      ExistingAgreementActionInput,
  ): Promise<PartnerEvidenceResult> {
    const resource =
      await this.updateAttributes(
        resourceId,
        {
          agreementReference:
            input.agreementReference,
          existingAgreementComplianceMandateIssued:
            input.complianceMandateIssued,
          existingAgreementComplianceAction:
            input.action,
        },
        input.correlationId,
        "covered-contractor",
      );

    const evidence =
      await this.createEvidence(
        resourceId,
        "fdea.existing-agreement-compliance-action",
        "Existing agreement compliance action",
        {
          observedAt:
            input.observedAt,
          agreementReference:
            input.agreementReference,
          action:
            input.action,
          complianceMandateIssued:
            input.complianceMandateIssued,
          issuedAt:
            input.issuedAt,
        },
        input.correlationId,
      );

    return {
      resource,
      evidence,
    };
  }

  async recordContractorPeriodicEvaluation(
    resourceId: string,
    input:
      ContractorPeriodicEvaluationInput,
  ): Promise<PartnerEvidenceResult> {
    const resource =
      await this.updateAttributes(
        resourceId,
        {
          periodicComplianceEvaluationIncorporated:
            true,
          lastPeriodicEvaluationAt:
            input.observedAt,
          complianceAuditCurrent:
            true,
          section4ControlsImplemented:
            input.section4ControlsVerified,
        },
        input.correlationId,
        "covered-contractor",
      );

    const evidence =
      await this.createEvidence(
        resourceId,
        "fdea.contractor-periodic-evaluation",
        "Periodic contractor compliance evaluation",
        {
          observedAt:
            input.observedAt,
          evaluatorRole:
            input.evaluatorRole,
          section4ControlsVerified:
            input.section4ControlsVerified,
          significantFailureFound:
            input.significantFailureFound,
          materialBreachDetermination:
            input.materialBreachDetermination ??
            null,
          assessmentReference:
            input.assessmentReference ??
            null,
          enforcementDisposition:
            input.enforcementDisposition,
        },
        input.correlationId,
      );

    return {
      resource,
      evidence,
    };
  }

  async recordExternalServiceAgreement(
    resourceId: string,
    input:
      ExternalServiceAgreementInput,
  ): Promise<PartnerEvidenceResult> {
    const resource =
      await this.updateAttributes(
        resourceId,
        {
          agreementReference:
            input.agreementReference,
          agreementKind:
            input.agreementKind,
          agreementRequiresSection4Compliance:
            input.requiresSection4Compliance,
        },
        input.correlationId,
        "external-service",
      );

    const evidence =
      await this.createEvidence(
        resourceId,
        "fdea.external-service-agreement",
        "External service agreement",
        {
          observedAt:
            input.observedAt,
          agreementReference:
            input.agreementReference,
          agreementKind:
            input.agreementKind,
          requiresSection4Compliance:
            input.requiresSection4Compliance,
        },
        input.correlationId,
      );

    return {
      resource,
      evidence,
    };
  }

  async recordExternalServiceAssessment(
    resourceId: string,
    input:
      ExternalServiceAssessmentInput,
  ): Promise<PartnerEvidenceResult> {
    const patch:
      ResourceAttributePatch = {
        section4ControlsImplemented:
          input.section4ControlsVerified,
      };

    if (
      input.cloudDataEncrypted !==
      undefined
    ) {
      patch.cloudDataEncrypted =
        input.cloudDataEncrypted;
    }

    if (
      input.keysPreventUnauthorizedProviderAccess !==
      undefined
    ) {
      patch.keysPreventUnauthorizedProviderAccess =
        input.keysPreventUnauthorizedProviderAccess;
    }

    if (
      input.providerAccessExplicitlyPermittedByAgency !==
      undefined
    ) {
      patch.providerAccessExplicitlyPermittedByAgency =
        input.providerAccessExplicitlyPermittedByAgency;
    }

    const resource =
      await this.updateAttributes(
        resourceId,
        patch,
        input.correlationId,
        "external-service",
      );

    const evidence =
      await this.createEvidence(
        resourceId,
        "fdea.external-service-assessment",
        "External service encryption assessment",
        {
          observedAt:
            input.observedAt,
          section4ControlsVerified:
            input.section4ControlsVerified,
          serviceReference:
            input.serviceReference ??
            null,
          cloudDataEncrypted:
            input.cloudDataEncrypted ??
            null,
          keysPreventUnauthorizedProviderAccess:
            input.keysPreventUnauthorizedProviderAccess ??
            null,
          providerAccessExplicitlyPermittedByAgency:
            input.providerAccessExplicitlyPermittedByAgency ??
            null,
        },
        input.correlationId,
      );

    return {
      resource,
      evidence,
    };
  }

  async evaluatePartner(
    resourceId: string,
    options:
      PartnerEvaluationOptions,
  ): Promise<PartnerEvaluationResult> {
    const resource =
      await this.client
        .getResource(
          resourceId,
        );
    assertPartnerResource(
      resource,
    );

    const evaluation =
      await this.evaluator
        .evaluateResource({
          resourceId,
          evaluationMode:
            options.evaluationMode,
          requestedByPrincipalId:
            options.requestedByPrincipalId,
          evaluatedAt:
            options.evaluatedAt,
          correlationId:
            options.correlationId,
          syncFindings:
            options.syncFindings,
        });

    return {
      resource,
      evaluation,
    };
  }

  private async updateAttributes(
    resourceId: string,
    patch:
      ResourceAttributePatch,
    correlationId:
      string | null | undefined,
    expectedResourceType:
      "covered-contractor"
      | "external-service",
  ): Promise<Resource> {
    const current =
      await this.client
        .getResource(
          resourceId,
        );

    if (
      current.resourceType !==
      expectedResourceType
    ) {
      throw new Error(
        "resource must be " +
          expectedResourceType,
      );
    }

    return this.client
      .updateResource(
        resourceId,
        {
          expectedUpdatedAt:
            current.updatedAt,
          attributes: {
            ...current.attributes,
            ...patch,
          },
          correlationId:
            correlationId ??
            null,
        },
      );
  }

  private async createEvidence(
    resourceId: string,
    evidenceType: string,
    title: string,
    attributes: JsonObject,
    correlationId?:
      string | null,
  ): Promise<EvidenceView> {
    const observedAt =
      typeof attributes
        .observedAt ===
      "string"
        ? attributes.observedAt
        : null;

    return this.client
      .createEvidence({
        resourceId,
        evidenceType,
        title,
        source:
          "federal-encryption-compliance",
        capturedAt:
          observedAt,
        attributes,
        metadata: {
          federalEncryption: {
            policyFamily:
              "federal-data-encryption-act",
            partnerWorkflow:
              true,
          },
        },
        correlationId:
          correlationId ??
          null,
      });
  }
}

function assertPartnerResource(
  resource: Resource,
): void {
  if (
    resource.resourceType !==
      "covered-contractor" &&
    resource.resourceType !==
      "external-service"
  ) {
    throw new Error(
      "resource is not a contractor or external service",
    );
  }
}
