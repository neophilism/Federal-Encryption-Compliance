import type {
  CertificationView,
  DeadlineView,
  Finding,
  FindingView,
  JsonObject,
  Resource,
} from "@caiae/sdk";

export type ComplianceAssessment =
  | "pass"
  | "fail"
  | "unknown"
  | "not_applicable";

export type SystemComplianceSnapshot = {
  resourceId: string;
  supportingCheckId: string;
  name?: string;
  category?: string;
  handlesCoveredInformation: boolean;
  overallCompliance: ComplianceAssessment;
  transitEncryption: ComplianceAssessment;
  atRestEncryption: ComplianceAssessment;
  noncomplianceReasons?: string[];
};

export type ComplianceMeasure = {
  compliant: number;
  total: number;
  percentage: number | null;
};

export type NoncompliantSystemSummary = {
  resourceId: string;
  name: string | null;
  category: string | null;
  supportingCheckId: string;
  overallCompliance: ComplianceAssessment;
  transitEncryption: ComplianceAssessment;
  atRestEncryption: ComplianceAssessment;
  reasons: string[];
};

export type AgencyComplianceSummary = {
  coveredSystems: number;
  overall: ComplianceMeasure;
  encryptionInTransit: ComplianceMeasure;
  encryptionAtRest: ComplianceMeasure;
  noncompliantSystems: NoncompliantSystemSummary[];
};

export type ContractorExternalAttestation = {
  attestedNoLoopholes: boolean;
  narrative: string;
  supportingReferences: string[];
};

export type EncryptionIncident = {
  incidentReference: string;
  occurredAt?: string;
  discoveredAt?: string;
  exposure: "in_transit" | "at_rest" | "both";
  description: string;
  remedialActions: string[];
};

export type RemediationMilestoneSummary = {
  milestoneId: string;
  description: string;
  dueAt?: string;
  status:
    | "planned"
    | "in_progress"
    | "completed"
    | "verified";
};

export type RemediationPlanSummary = {
  reference: string;
  description: string;
  milestones: RemediationMilestoneSummary[];
  expectedCompletionAt?: string;
  resourceNeeds?: string;
};

export type AnnualCertificationReportInput = {
  agencyResourceId: string;
  reportingYear: number;
  submittedAt: string;
  certifyingPrincipalId: string;
  incidentReportingPeriod: {
    startAt: string;
    endAt: string;
  };
  systems: SystemComplianceSnapshot[];
  incidents: EncryptionIncident[];
  remediationPlans: RemediationPlanSummary[];
  contractorExternalAttestation:
    ContractorExternalAttestation;
  inabilityExplanation?: string;
};

export type AnnualCertificationReport = {
  schemaVersion: "1";
  reportType:
    "fdea-section-6-annual-certification-filing";
  agencyResourceId: string;
  reportingYear: number;
  submittedAt: string;
  certifyingPrincipalId: string;
  incidentReportingPeriod: {
    startAt: string;
    endAt: string;
  };
  compliance: AgencyComplianceSummary;
  supportingCheckIds: string[];
  incidents: EncryptionIncident[];
  remediationPlans: RemediationPlanSummary[];
  contractorExternalAttestation:
    ContractorExternalAttestation;
  fullCompliance: boolean;
  inabilityExplanation: string | null;
};

export type QuarterlyProgressReportInput = {
  agencyResourceId: string;
  rootNoncomplianceReference: string;
  sequence: number;
  submittedAt: string;
  submittedByPrincipalId: string;
  systems: SystemComplianceSnapshot[];
  remediationPlans: RemediationPlanSummary[];
  contractorExternalAttestation:
    ContractorExternalAttestation;
  progressNarrative: string;
};

export type QuarterlyProgressReport = {
  schemaVersion: "1";
  reportType:
    "fdea-section-6-quarterly-progress-update";
  agencyResourceId: string;
  rootNoncomplianceReference: string;
  sequence: number;
  submittedAt: string;
  submittedByPrincipalId: string;
  compliance: AgencyComplianceSummary;
  supportingCheckIds: string[];
  remediationPlans: RemediationPlanSummary[];
  contractorExternalAttestation:
    ContractorExternalAttestation;
  progressNarrative: string;
  fullCompliance: boolean;
};

export type FederalAccountabilityManagerOptions = {
  baseUrl: string;
  organizationId: string;
  operatorToken: string;
  enactmentAt: string;
  enactmentReference: string;
  fetchImpl?: typeof fetch;
};

type BaseRemediationInput = {
  createdByPrincipalId: string;
  ownerPrincipalId?: string | null;
  plan: string;
  correlationId?: string | null;
};

export type CreateFederalRemediationInput =
  | (
      BaseRemediationInput & {
        kind: "agency-remediation";
        authorityReference?:
          string;
        dueAt?: string | null;
        warningWindowSeconds?: number;
        gracePeriodSeconds?: number;
        escalationAfterSeconds?: number[];
      }
    )
  | (
      BaseRemediationInput & {
        kind:
          "omb-corrective-action";
        correctiveActionPlanReference:
          string;
        milestoneId: string;
        oversightDeadlineId: string;
      }
    );

export type RemediationActionInput = {
  principalId: string;
  correlationId?: string | null;
};

export type VerifyFederalRemediationInput =
  RemediationActionInput & {
    note?: string;
  };

export type CompleteOmbMilestoneInput = {
  findingId: string;
  remediationId: string;
  oversightDeadlineId: string;
  principalId: string;
  satisfiedAt?: string;
  correlationId?: string | null;
};

export type SystemCertificationInput = {
  resourceId: string;
  supportingCheckId: string;
  issuedByPrincipalId: string;
  validFrom?: string;
  validUntil?: string;
  validitySeconds?: number;
  maximumCheckAgeSeconds?: number;
  ruleSetId?: string | null;
  ruleSetVersion?: string | null;
  metadata?: JsonObject;
  correlationId?: string | null;
};

export type RenewSystemCertificationInput = {
  supportingCheckId: string;
  issuedByPrincipalId: string;
  validFrom?: string;
  validUntil?: string;
  validitySeconds?: number;
  maximumCheckAgeSeconds?: number;
  ruleSetId?: string | null;
  ruleSetVersion?: string | null;
  metadata?: JsonObject;
  correlationId?: string | null;
};

export type CertificationActionInput = {
  principalId: string;
  reason: string;
  correlationId?: string | null;
};

export type ReinstateSystemCertificationInput = {
  supportingCheckId: string;
  principalId: string;
  rationale: string;
  correlationId?: string | null;
};

export type SubmitAnnualCertificationInput =
  AnnualCertificationReportInput & {
    annualDeadlineId: string;
    correlationId?: string | null;
  };

export type AnnualCertificationSubmission = {
  report: AnnualCertificationReport;
  filing: Resource;
  nextQuarterlyDeadline:
    DeadlineView | null;
};

export type SubmitQuarterlyProgressInput =
  QuarterlyProgressReportInput & {
    quarterlyDeadlineId: string;
    correlationId?: string | null;
  };

export type QuarterlyProgressSubmission = {
  report: QuarterlyProgressReport;
  filing: Resource;
  nextQuarterlyDeadline:
    DeadlineView | null;
};

export type FindingSyncResult = {
  findings: Finding[];
};

export type FederalFindingView =
  FindingView;

export type SystemCertificationView =
  CertificationView;
