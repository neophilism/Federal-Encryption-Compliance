import type {
  Deadline,
  DeadlineStatusSnapshot,
  DeadlineView,
} from "@caiae/sdk";

export type FederalOversightManagerOptions = {
  baseUrl: string;
  organizationId: string;
  operatorToken: string;
  enactmentAt: string;
  enactmentReference: string;
  fetchImpl?: typeof fetch;
};

export type EnactmentClockProvisionInput = {
  createdByPrincipalId: string;
  agencyResourceIds?: string[];
  existingContractorResourceIds?: string[];
  correlationId?: string | null;
};

export type ProvisionedEnactmentClocks = {
  nistGuidance: DeadlineView;
  agencyImplementation: DeadlineView[];
  existingContractTransitions: DeadlineView[];
  gaoEvaluation: DeadlineView;
};

export type AnnualCertificationScheduleInput = {
  agencyResourceId: string;
  reportingYear: number;
  ombDueAt: string;
  ombDirectiveReference: string;
  createdByPrincipalId: string;
  correlationId?: string | null;
};

export type QuarterlyProgressScheduleInput = {
  agencyResourceId: string;
  previousReportAt: string;
  sequence: number;
  noncomplianceReference: string;
  createdByPrincipalId: string;
  correlationId?: string | null;
};

export type OmbCorrectiveActionMilestoneInput = {
  agencyResourceId: string;
  correctiveActionPlanReference: string;
  milestoneId: string;
  milestoneDescription: string;
  dueAt: string;
  createdByPrincipalId: string;
  correlationId?: string | null;
};

export type InspectorGeneralReviewScheduleInput = {
  agencyResourceId: string;
  reviewId: string;
  reviewFrameworkReference: string;
  dueAt: string;
  createdByPrincipalId: string;
  correlationId?: string | null;
};

export type CompleteOversightDeadlineInput = {
  principalId: string;
  satisfiedAt?: string;
  correlationId?: string | null;
};

export type OversightDeadline = Deadline;
export type OversightDeadlineView = DeadlineView;
export type OversightDeadlineStatus = DeadlineStatusSnapshot;
