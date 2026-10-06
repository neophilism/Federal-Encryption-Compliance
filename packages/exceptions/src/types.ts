import type {
  AuthorizationRecord,
  ExceptionEffectiveness,
  ExceptionRecordView,
  JsonObject,
} from "@caiae/sdk";

export type CompensatingControl = {
  controlId: string;
  description: string;
  verificationReference: string;
};

export type TechnicalImpracticabilityWaiverInput = {
  resourceId: string;
  targetRuleId: string;
  requestedByPrincipalId: string;
  technicalImpracticability: string;
  riskAssessmentReference: string;
  compensatingControls: CompensatingControl[];
  scope: JsonObject;
  validFrom?: string | null;
  validUntil: string;
  approvalAuthority: string;
  eligibleApproverPrincipalIds: string[];
  approvalQuorum?: number;
  renewalOfWaiverId?: string | null;
  correlationId?: string | null;
};

export type ClassifiedSystemExceptionInput = {
  resourceId: string;
  targetRuleId: string;
  requestedByPrincipalId: string;
  classifiedDirectiveReference: string;
  conflictDescription: string;
  compensatingControls: CompensatingControl[];
  scope: JsonObject;
  validFrom?: string | null;
  validUntil: string;
  approvalAuthority: string;
  eligibleApproverPrincipalIds: string[];
  approvalQuorum?: number;
  correlationId?: string | null;
};

export type EmergencyCommunicationsInput = {
  resourceId: string;
  requestedByPrincipalId: string;
  emergencyDescription: string;
  communicationPurpose: string;
  scope: JsonObject;
  validUntil: string;
  emergencyReviewDueAt: string;
  approvalAuthority: string;
  eligibleApproverPrincipalIds: string[];
  approvalQuorum?: number;
  correlationId?: string | null;
};

export type EmergencyReviewInput = {
  principalId: string;
  decision: "approve" | "deny";
  rationale: string;
  correlationId?: string | null;
};

export type WaiverResult = ExceptionRecordView;
export type WaiverEffectiveness = ExceptionEffectiveness;
export type EmergencyAuthorizationResult = AuthorizationRecord;
