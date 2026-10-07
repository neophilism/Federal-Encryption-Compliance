import type {
  EvidenceView,
  JsonObject,
  Resource,
} from "@caiae/sdk";
import type {
  EvaluationMode,
  FederalEvaluationResult,
} from "@federal-encryption/evaluation";

export type ArrangementType =
  | "contract"
  | "grant"
  | "cooperative-agreement"
  | "other-arrangement";

export type AgreementLifecycle =
  | "new-after-enactment"
  | "existing-at-enactment";

export type ExternalServiceKind =
  | "cloud"
  | "shared-service"
  | "external-information-system"
  | "international-partner"
  | "other";

export type ExternalAgreementKind =
  | "contract"
  | "memorandum-of-understanding"
  | "other-agreement";

export type ContractorResourceInput = {
  name: string;
  externalRef: string;
  sponsoringAgencyExternalRef: string;
  parentContractorExternalRef?: string | null;
  handlesCoveredInformation: boolean;
  arrangementType: ArrangementType;
  agreementReference?: string | null;
  agreementLifecycle: AgreementLifecycle;
  section4ControlsImplemented: boolean;
  agreementMakesSection4ComplianceMaterialCondition: boolean;
  existingAgreementComplianceMandateIssued?: boolean | null;
  existingAgreementComplianceAction?:
    | "modified"
    | "written-notice"
    | "pending"
    | "not-applicable";
  usesSubcontractors: boolean;
  subcontractorFlowdownAllTiersImplemented?: boolean | null;
  periodicComplianceEvaluationIncorporated: boolean;
  lastPeriodicEvaluationAt?: string | null;
  complianceAuditCurrent?: boolean | null;
};

export type ExternalServiceResourceInput = {
  name: string;
  externalRef: string;
  sponsoringAgencyExternalRef: string;
  serviceKind: ExternalServiceKind;
  agreementKind: ExternalAgreementKind;
  agreementReference?: string | null;
  handlesCoveredInformation: boolean;
  section4ControlsImplemented: boolean;
  agreementRequiresSection4Compliance: boolean;
  cloudDataEncrypted?: boolean | null;
  keysPreventUnauthorizedProviderAccess?: boolean | null;
  providerAccessExplicitlyPermittedByAgency?: boolean | null;
  permittedProviderAccessScope?: string | null;
};

export type ContractClauseInput = {
  observedAt: string;
  agreementReference: string;
  arrangementType: ArrangementType;
  requiresSection4Compliance: boolean;
  materialCondition: boolean;
  correlationId?: string | null;
};

export type SubcontractorFlowdownInput = {
  observedAt: string;
  flowdownImplemented: boolean;
  allTiersCovered: boolean;
  agreementReferences?: string[];
  correlationId?: string | null;
};

export type ExistingAgreementActionInput = {
  observedAt: string;
  agreementReference: string;
  action:
    | "modified"
    | "written-notice";
  complianceMandateIssued: boolean;
  issuedAt: string;
  correlationId?: string | null;
};

export type ContractorPeriodicEvaluationInput = {
  observedAt: string;
  evaluatorRole:
    | "contracting-officer"
    | "contracting-officer-delegee"
    | "agency-security-official"
    | "authorized-third-party-assessor";
  section4ControlsVerified: boolean;
  significantFailureFound: boolean;
  materialBreachDetermination?: boolean | null;
  assessmentReference?: string | null;
  enforcementDisposition:
    | "none"
    | "remediation-required"
    | "termination-for-default"
    | "suspension-debarment-referral"
    | "other";
  correlationId?: string | null;
};

export type ExternalServiceAgreementInput = {
  observedAt: string;
  agreementReference: string;
  agreementKind: ExternalAgreementKind;
  requiresSection4Compliance: boolean;
  correlationId?: string | null;
};

export type ExternalServiceAssessmentInput = {
  observedAt: string;
  section4ControlsVerified: boolean;
  serviceReference?: string | null;
  cloudDataEncrypted?: boolean | null;
  keysPreventUnauthorizedProviderAccess?: boolean | null;
  providerAccessExplicitlyPermittedByAgency?: boolean | null;
  correlationId?: string | null;
};

export type PartnerEvaluationOptions = {
  evaluationMode: EvaluationMode;
  requestedByPrincipalId?: string | null;
  evaluatedAt?: string;
  correlationId?: string | null;
  syncFindings?: boolean;
};

export type PartnerEvidenceResult = {
  resource: Resource;
  evidence: EvidenceView;
};

export type PartnerEvaluationResult = {
  resource: Resource;
  evaluation: FederalEvaluationResult;
};

export type ResourceAttributePatch =
  JsonObject;
