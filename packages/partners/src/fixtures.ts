import type {
  FederalResourceFixture,
} from "@federal-encryption/evaluation";

const observedAt =
  "2026-10-06T16:30:00.000Z";

export const compliantContractor:
  FederalResourceFixture = {
    id:
      "compliant-covered-contractor",
    description:
      "Existing covered contract with Section 4 controls, material compliance condition, all-tier flow-down, compliance mandate, and current periodic evaluation.",
    expectedStatus: "pass",
    resource: {
      resourceType:
        "covered-contractor",
      name:
        "Fixture — Compliant Covered Contractor",
      externalRef:
        "fixture:contractor:pass",
      attributes: {
        sponsoringAgencyExternalRef:
          "agency-example",
        parentContractorExternalRef:
          null,
        handlesCoveredInformation:
          true,
        arrangementType:
          "contract",
        agreementReference:
          "contract-001",
        agreementLifecycle:
          "existing-at-enactment",
        section4ControlsImplemented:
          true,
        agreementMakesSection4ComplianceMaterialCondition:
          true,
        existingAgreementComplianceMandateIssued:
          true,
        existingAgreementComplianceAction:
          "modified",
        usesSubcontractors:
          true,
        subcontractorFlowdownAllTiersImplemented:
          true,
        periodicComplianceEvaluationIncorporated:
          true,
        lastPeriodicEvaluationAt:
          observedAt,
        complianceAuditCurrent:
          true,
      },
    },
    evidence: [
      {
        evidenceType:
          "fdea.contractor-compliance-assessment",
        title:
          "Contractor Section 4 assessment",
        attributes: {
          observedAt,
          section4ControlsVerified:
            true,
          assessmentReference:
            "assessment-001",
        },
      },
      {
        evidenceType:
          "fdea.contract-compliance-clause",
        title:
          "Contract compliance clause",
        attributes: {
          observedAt,
          agreementReference:
            "contract-001",
          requiresSection4Compliance:
            true,
          materialCondition:
            true,
          arrangementType:
            "contract",
        },
      },
      {
        evidenceType:
          "fdea.subcontractor-flowdown",
        title:
          "Subcontractor flow-down verification",
        attributes: {
          observedAt,
          flowdownImplemented:
            true,
          allTiersCovered:
            true,
          agreementReferences: [
            "subcontract-001",
          ],
        },
      },
      {
        evidenceType:
          "fdea.existing-agreement-compliance-action",
        title:
          "Existing agreement compliance action",
        attributes: {
          observedAt,
          agreementReference:
            "contract-001",
          action:
            "modified",
          complianceMandateIssued:
            true,
          issuedAt:
            observedAt,
        },
      },
      {
        evidenceType:
          "fdea.contractor-periodic-evaluation",
        title:
          "Periodic contractor compliance evaluation",
        attributes: {
          observedAt,
          evaluatorRole:
            "contracting-officer",
          section4ControlsVerified:
            true,
          significantFailureFound:
            false,
          materialBreachDetermination:
            null,
          assessmentReference:
            "periodic-001",
          enforcementDisposition:
            "none",
        },
      },
    ],
  };

export const failingContractor:
  FederalResourceFixture = {
    id:
      "failing-covered-contractor",
    description:
      "Existing covered contractor with each currently modeled Section 5 contractor control failing while evidence is present.",
    expectedStatus: "fail",
    resource: {
      resourceType:
        "covered-contractor",
      name:
        "Fixture — Failing Covered Contractor",
      externalRef:
        "fixture:contractor:fail",
      attributes: {
        sponsoringAgencyExternalRef:
          "agency-example",
        parentContractorExternalRef:
          null,
        handlesCoveredInformation:
          true,
        arrangementType:
          "contract",
        agreementReference:
          "contract-002",
        agreementLifecycle:
          "existing-at-enactment",
        section4ControlsImplemented:
          false,
        agreementMakesSection4ComplianceMaterialCondition:
          false,
        existingAgreementComplianceMandateIssued:
          false,
        existingAgreementComplianceAction:
          "pending",
        usesSubcontractors:
          true,
        subcontractorFlowdownAllTiersImplemented:
          false,
        periodicComplianceEvaluationIncorporated:
          false,
        lastPeriodicEvaluationAt:
          observedAt,
        complianceAuditCurrent:
          false,
      },
    },
    evidence: [
      {
        evidenceType:
          "fdea.contractor-compliance-assessment",
        title:
          "Contractor Section 4 assessment",
        attributes: {
          observedAt,
          section4ControlsVerified:
            false,
          assessmentReference:
            "assessment-002",
        },
      },
      {
        evidenceType:
          "fdea.contract-compliance-clause",
        title:
          "Contract compliance clause",
        attributes: {
          observedAt,
          agreementReference:
            "contract-002",
          requiresSection4Compliance:
            false,
          materialCondition:
            false,
          arrangementType:
            "contract",
        },
      },
      {
        evidenceType:
          "fdea.subcontractor-flowdown",
        title:
          "Subcontractor flow-down verification",
        attributes: {
          observedAt,
          flowdownImplemented:
            false,
          allTiersCovered:
            false,
          agreementReferences: [],
        },
      },
      {
        evidenceType:
          "fdea.existing-agreement-compliance-action",
        title:
          "Existing agreement compliance action",
        attributes: {
          observedAt,
          agreementReference:
            "contract-002",
          action:
            "written-notice",
          complianceMandateIssued:
            false,
          issuedAt:
            observedAt,
        },
      },
      {
        evidenceType:
          "fdea.contractor-periodic-evaluation",
        title:
          "Periodic contractor compliance evaluation",
        attributes: {
          observedAt,
          evaluatorRole:
            "authorized-third-party-assessor",
          section4ControlsVerified:
            false,
          significantFailureFound:
            true,
          materialBreachDetermination:
            true,
          assessmentReference:
            "periodic-002",
          enforcementDisposition:
            "remediation-required",
        },
      },
    ],
  };

export const compliantCloudService:
  FederalResourceFixture = {
    id:
      "compliant-cloud-service",
    description:
      "Covered cloud service with Section 4 controls, compliant agreement, encrypted Federal data, and provider-safe key management.",
    expectedStatus: "pass",
    resource: {
      resourceType:
        "external-service",
      name:
        "Fixture — Compliant Cloud Service",
      externalRef:
        "fixture:cloud:pass",
      attributes: {
        sponsoringAgencyExternalRef:
          "agency-example",
        serviceKind:
          "cloud",
        agreementKind:
          "contract",
        agreementReference:
          "cloud-contract-001",
        handlesCoveredInformation:
          true,
        section4ControlsImplemented:
          true,
        agreementRequiresSection4Compliance:
          true,
        cloudDataEncrypted:
          true,
        keysPreventUnauthorizedProviderAccess:
          true,
        providerAccessExplicitlyPermittedByAgency:
          false,
        permittedProviderAccessScope:
          null,
      },
    },
    evidence: [
      {
        evidenceType:
          "fdea.external-service-assessment",
        title:
          "Cloud service encryption assessment",
        attributes: {
          observedAt,
          section4ControlsVerified:
            true,
          serviceReference:
            "cloud-service-001",
          cloudDataEncrypted:
            true,
          keysPreventUnauthorizedProviderAccess:
            true,
          providerAccessExplicitlyPermittedByAgency:
            false,
        },
      },
      {
        evidenceType:
          "fdea.external-service-agreement",
        title:
          "Cloud service agreement",
        attributes: {
          observedAt,
          agreementReference:
            "cloud-contract-001",
          agreementKind:
            "contract",
          requiresSection4Compliance:
            true,
        },
      },
      {
        evidenceType:
          "fdea.key-management-controls",
        title:
          "Cloud key-management assessment",
        attributes: {
          observedAt,
          rotationManaged:
            true,
          keysStoredSeparately:
            true,
          providerUnauthorizedAccessPrevented:
            true,
        },
      },
    ],
  };

export const failingCloudService:
  FederalResourceFixture = {
    id:
      "failing-cloud-service",
    description:
      "Covered cloud service with every currently modeled Section 5 cloud control failing while evidence is present.",
    expectedStatus: "fail",
    resource: {
      resourceType:
        "external-service",
      name:
        "Fixture — Failing Cloud Service",
      externalRef:
        "fixture:cloud:fail",
      attributes: {
        sponsoringAgencyExternalRef:
          "agency-example",
        serviceKind:
          "cloud",
        agreementKind:
          "contract",
        agreementReference:
          "cloud-contract-002",
        handlesCoveredInformation:
          true,
        section4ControlsImplemented:
          false,
        agreementRequiresSection4Compliance:
          false,
        cloudDataEncrypted:
          false,
        keysPreventUnauthorizedProviderAccess:
          false,
        providerAccessExplicitlyPermittedByAgency:
          false,
        permittedProviderAccessScope:
          null,
      },
    },
    evidence: [
      {
        evidenceType:
          "fdea.external-service-assessment",
        title:
          "Cloud service encryption assessment",
        attributes: {
          observedAt,
          section4ControlsVerified:
            false,
          serviceReference:
            "cloud-service-002",
          cloudDataEncrypted:
            false,
          keysPreventUnauthorizedProviderAccess:
            false,
          providerAccessExplicitlyPermittedByAgency:
            false,
        },
      },
      {
        evidenceType:
          "fdea.external-service-agreement",
        title:
          "Cloud service agreement",
        attributes: {
          observedAt,
          agreementReference:
            "cloud-contract-002",
          agreementKind:
            "contract",
          requiresSection4Compliance:
            false,
        },
      },
      {
        evidenceType:
          "fdea.key-management-controls",
        title:
          "Cloud key-management assessment",
        attributes: {
          observedAt,
          rotationManaged:
            false,
          keysStoredSeparately:
            false,
          providerUnauthorizedAccessPrevented:
            false,
        },
      },
    ],
  };

export const compliantSharedService:
  FederalResourceFixture = {
    id:
      "compliant-shared-service",
    description:
      "Covered non-cloud shared service satisfying the two general external-system controls; cloud-only controls are not applicable.",
    expectedStatus: "pass",
    resource: {
      resourceType:
        "external-service",
      name:
        "Fixture — Compliant Shared Service",
      externalRef:
        "fixture:shared-service:pass",
      attributes: {
        sponsoringAgencyExternalRef:
          "agency-example",
        serviceKind:
          "shared-service",
        agreementKind:
          "memorandum-of-understanding",
        agreementReference:
          "mou-001",
        handlesCoveredInformation:
          true,
        section4ControlsImplemented:
          true,
        agreementRequiresSection4Compliance:
          true,
        cloudDataEncrypted:
          null,
        keysPreventUnauthorizedProviderAccess:
          null,
        providerAccessExplicitlyPermittedByAgency:
          null,
        permittedProviderAccessScope:
          null,
      },
    },
    evidence: [
      {
        evidenceType:
          "fdea.external-service-assessment",
        title:
          "Shared service encryption assessment",
        attributes: {
          observedAt,
          section4ControlsVerified:
            true,
          serviceReference:
            "shared-service-001",
          cloudDataEncrypted:
            null,
          keysPreventUnauthorizedProviderAccess:
            null,
          providerAccessExplicitlyPermittedByAgency:
            null,
        },
      },
      {
        evidenceType:
          "fdea.external-service-agreement",
        title:
          "Shared service memorandum",
        attributes: {
          observedAt,
          agreementReference:
            "mou-001",
          agreementKind:
            "memorandum-of-understanding",
          requiresSection4Compliance:
            true,
        },
      },
    ],
  };

export const partnerFixtures =
  [
    compliantContractor,
    failingContractor,
    compliantCloudService,
    failingCloudService,
    compliantSharedService,
  ] as const;

export function getPartnerFixture(
  id: string,
): FederalResourceFixture {
  const fixture =
    partnerFixtures.find(
      (candidate) =>
        candidate.id === id,
    );

  if (!fixture) {
    throw new Error(
      "unknown partner fixture: " +
        id,
    );
  }

  return fixture;
}
