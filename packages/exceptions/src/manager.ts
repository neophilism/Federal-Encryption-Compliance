import {
  createOperatorClient,
  type AuthorizationEffectiveness,
  type ComplianceEngineClient,
  type ExceptionEffectiveness,
} from "@caiae/sdk";
import type {
  ClassifiedSystemExceptionInput,
  EmergencyCommunicationsInput,
  EmergencyReviewInput,
  TechnicalImpracticabilityWaiverInput,
} from "./types.js";

export type FederalExceptionManagerOptions = {
  baseUrl: string;
  organizationId: string;
  operatorToken: string;
  fetchImpl?: typeof fetch;
};

const MAX_WAIVER_MS =
  365 * 24 * 60 * 60 * 1000;

export class FederalExceptionManager {
  private readonly client:
    ComplianceEngineClient;

  constructor(
    options:
      FederalExceptionManagerOptions,
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

  async requestTechnicalImpracticabilityWaiver(
    input:
      TechnicalImpracticabilityWaiverInput,
  ) {
    validateWaiverWindow(
      input.validFrom,
      input.validUntil,
    );
    validateSpecificRule(
      input.targetRuleId,
    );
    validateNarrative(
      input.technicalImpracticability,
      "technicalImpracticability",
    );
    validateNarrative(
      input.riskAssessmentReference,
      "riskAssessmentReference",
    );
    validateCompensatingControls(
      input.compensatingControls,
    );
    validateSpecificScope(
      input.scope,
    );
    validateApprovers(
      input.eligibleApproverPrincipalIds,
      input.approvalQuorum,
    );

    return this.client
      .requestException({
        resourceId:
          input.resourceId,
        ruleId:
          input.targetRuleId,
        kind:
          "waiver",
        requestedByPrincipalId:
          input.requestedByPrincipalId,
        justification:
          input.technicalImpracticability,
        validFrom:
          input.validFrom,
        validUntil:
          input.validUntil,
        scope:
          input.scope,
        conditions: {
          technicalImpracticabilityEstablished:
            true,
          riskAssessmentReference:
            input.riskAssessmentReference,
          compensatingControls:
            input.compensatingControls,
          renewalRequiresFreshRequest:
            true,
        },
        approvalQuorum:
          input.approvalQuorum,
        approvalAuthority:
          input.approvalAuthority,
        eligibleApproverPrincipalIds:
          input.eligibleApproverPrincipalIds,
        metadata: {
          federalEncryption: {
            section:
              "7",
            exceptionType:
              "technical-impracticability-waiver",
            blanketWaiver:
              false,
            renewalOfWaiverId:
              input.renewalOfWaiverId ??
              null,
          },
        },
        correlationId:
          input.correlationId,
      });
  }

  async requestClassifiedSystemException(
    input:
      ClassifiedSystemExceptionInput,
  ) {
    validateWaiverWindow(
      input.validFrom,
      input.validUntil,
    );
    validateSpecificRule(
      input.targetRuleId,
    );
    validateNarrative(
      input.classifiedDirectiveReference,
      "classifiedDirectiveReference",
    );
    validateNarrative(
      input.conflictDescription,
      "conflictDescription",
    );
    validateCompensatingControls(
      input.compensatingControls,
    );
    validateSpecificScope(
      input.scope,
    );
    validateApprovers(
      input.eligibleApproverPrincipalIds,
      input.approvalQuorum,
    );

    return this.client
      .requestException({
        resourceId:
          input.resourceId,
        ruleId:
          input.targetRuleId,
        kind:
          "exception",
        requestedByPrincipalId:
          input.requestedByPrincipalId,
        justification:
          input.conflictDescription,
        validFrom:
          input.validFrom,
        validUntil:
          input.validUntil,
        scope:
          input.scope,
        conditions: {
          classifiedDirectiveReference:
            input.classifiedDirectiveReference,
          compensatingControls:
            input.compensatingControls,
        },
        approvalQuorum:
          input.approvalQuorum,
        approvalAuthority:
          input.approvalAuthority,
        eligibleApproverPrincipalIds:
          input.eligibleApproverPrincipalIds,
        metadata: {
          federalEncryption: {
            section:
              "7",
            exceptionType:
              "classified-system-conflict",
            blanketWaiver:
              false,
          },
        },
        correlationId:
          input.correlationId,
      });
  }

  async requestEmergencyCommunicationsException(
    input:
      EmergencyCommunicationsInput,
  ) {
    validateNarrative(
      input.emergencyDescription,
      "emergencyDescription",
    );
    validateNarrative(
      input.communicationPurpose,
      "communicationPurpose",
    );
    validateSpecificScope(
      input.scope,
    );
    validateEmergencyWindow(
      input.validUntil,
      input.emergencyReviewDueAt,
    );
    validateApprovers(
      input.eligibleApproverPrincipalIds,
      input.approvalQuorum,
    );

    return this.client
      .requestAuthorization({
        resourceId:
          input.resourceId,
        authorizationType:
          "fdea.s7.emergency-communications",
        requestedByPrincipalId:
          input.requestedByPrincipalId,
        validUntil:
          input.validUntil,
        scope:
          input.scope,
        conditions: {
          emergencyDescription:
            input.emergencyDescription,
          communicationPurpose:
            input.communicationPurpose,
          ordinaryControlsResumeWhenEmergencyEnds:
            true,
          mandatoryPostEmergencyReview:
            true,
        },
        approvalQuorum:
          input.approvalQuorum,
        approvalAuthority:
          input.approvalAuthority,
        eligibleApproverPrincipalIds:
          input.eligibleApproverPrincipalIds,
        emergency:
          true,
        emergencyReviewDueAt:
          input.emergencyReviewDueAt,
        metadata: {
          federalEncryption: {
            section:
              "7",
            exceptionType:
              "emergency-communications",
          },
        },
        correlationId:
          input.correlationId,
      });
  }

  async reviewEmergencyCommunications(
    authorizationId: string,
    input:
      EmergencyReviewInput,
  ) {
    validateNarrative(
      input.rationale,
      "rationale",
    );

    return this.client
      .recordAuthorizationDecision(
        authorizationId,
        input,
      );
  }

  async approveWaiver(
    waiverId: string,
    principalId: string,
    rationale: string,
    correlationId?: string | null,
  ) {
    validateNarrative(
      rationale,
      "rationale",
    );
    return this.client
      .recordExceptionDecision(
        waiverId,
        {
          principalId,
          decision:
            "approve",
          rationale,
          correlationId,
        },
      );
  }

  async denyWaiver(
    waiverId: string,
    principalId: string,
    rationale: string,
    correlationId?: string | null,
  ) {
    validateNarrative(
      rationale,
      "rationale",
    );
    return this.client
      .recordExceptionDecision(
        waiverId,
        {
          principalId,
          decision:
            "deny",
          rationale,
          correlationId,
        },
      );
  }

  async waiverEffectiveness(
    waiverId: string,
    at?: string,
  ): Promise<
    ExceptionEffectiveness
  > {
    return this.client
      .getExceptionEffectiveness(
        waiverId,
        at,
      );
  }

  async emergencyEffectiveness(
    authorizationId: string,
    at?: string,
  ): Promise<
    AuthorizationEffectiveness
  > {
    return this.client
      .getAuthorizationEffectiveness(
        authorizationId,
        at,
      );
  }
}

function validateWaiverWindow(
  validFrom:
    string | null | undefined,
  validUntil: string,
): void {
  const from =
    parseDate(
      validFrom ??
        new Date().toISOString(),
      "validFrom",
    );
  const until =
    parseDate(
      validUntil,
      "validUntil",
    );

  if (
    until.getTime() <=
    from.getTime()
  ) {
    throw new Error(
      "validUntil must be after validFrom",
    );
  }

  if (
    until.getTime() -
      from.getTime() >
    MAX_WAIVER_MS
  ) {
    throw new Error(
      "Section 7 waiver or classified exception cannot exceed one year",
    );
  }
}

function validateEmergencyWindow(
  validUntil: string,
  reviewDueAt: string,
): void {
  const now =
    Date.now();
  const until =
    parseDate(
      validUntil,
      "validUntil",
    ).getTime();
  const review =
    parseDate(
      reviewDueAt,
      "emergencyReviewDueAt",
    ).getTime();

  if (
    until <= now
  ) {
    throw new Error(
      "emergency validUntil must be in the future",
    );
  }

  if (
    review <= now ||
    review > until
  ) {
    throw new Error(
      "emergency review must be due after request and no later than validUntil",
    );
  }
}

function validateSpecificRule(
  ruleId: string,
): void {
  const value =
    ruleId.trim();
  if (
    value.length === 0 ||
    value === "*" ||
    value.toLowerCase() ===
      "all"
  ) {
    throw new Error(
      "Section 7 does not permit a blanket waiver; targetRuleId must identify one specific rule",
    );
  }
}

function validateSpecificScope(
  scope:
    Record<string, unknown>,
): void {
  if (
    Object.keys(scope)
      .length === 0
  ) {
    throw new Error(
      "Section 7 exception scope must be specific and non-empty",
    );
  }

  const blanket =
    Object.values(scope)
      .some(
        (value) =>
          value === "*" ||
          (
            typeof value ===
              "string" &&
            value
              .trim()
              .toLowerCase() ===
              "all"
          ),
      );

  if (blanket) {
    throw new Error(
      "Section 7 does not permit blanket exception scope",
    );
  }
}

function validateCompensatingControls(
  controls:
    readonly {
      controlId: string;
      description: string;
      verificationReference: string;
    }[],
): void {
  if (
    controls.length === 0
  ) {
    throw new Error(
      "at least one compensating control is required",
    );
  }

  for (
    const control of controls
  ) {
    validateNarrative(
      control.controlId,
      "controlId",
    );
    validateNarrative(
      control.description,
      "control description",
    );
    validateNarrative(
      control.verificationReference,
      "control verificationReference",
    );
  }
}

function validateApprovers(
  approvers: string[],
  quorum = 1,
): void {
  const unique =
    new Set(
      approvers.filter(
        (value) =>
          value.trim().length >
          0,
      ),
    );

  if (
    unique.size === 0
  ) {
    throw new Error(
      "at least one eligible approver is required",
    );
  }

  if (
    !Number.isInteger(
      quorum,
    ) ||
    quorum < 1 ||
    quorum > unique.size
  ) {
    throw new Error(
      "approvalQuorum must be a positive integer no greater than the number of eligible approvers",
    );
  }
}

function validateNarrative(
  value: string,
  field: string,
): void {
  if (
    value.trim().length ===
    0
  ) {
    throw new Error(
      field +
        " is required",
    );
  }
}

function parseDate(
  value: string,
  field: string,
): Date {
  const parsed =
    new Date(value);
  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    throw new Error(
      field +
        " must be a valid date-time",
    );
  }
  return parsed;
}
