import {
  createHash,
} from "node:crypto";
import {
  createOperatorClient,
  type CertificationView,
  type ComplianceEngineClient,
  type Finding,
  type FindingView,
  type JsonObject,
  type Resource,
} from "@caiae/sdk";
import {
  FederalOversightManager,
  normalizeDateTime,
} from "@federal-encryption/oversight";
import {
  buildAnnualCertificationReport,
  buildQuarterlyProgressReport,
} from "./report.js";
import type {
  AnnualCertificationSubmission,
  CertificationActionInput,
  CompleteOmbMilestoneInput,
  CreateFederalRemediationInput,
  FederalAccountabilityManagerOptions,
  QuarterlyProgressSubmission,
  ReinstateSystemCertificationInput,
  RemediationActionInput,
  RenewSystemCertificationInput,
  SubmitAnnualCertificationInput,
  SubmitQuarterlyProgressInput,
  SystemCertificationInput,
  VerifyFederalRemediationInput,
} from "./types.js";

const SOURCE_DOCUMENT =
  "Federal Data Encryption Act of 2025";

const ALL_FINDING_SEVERITIES = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const;

export class FederalAccountabilityManager {
  private readonly client:
    ComplianceEngineClient;
  private readonly oversight:
    FederalOversightManager;
  private readonly enactmentAt:
    string;
  private readonly enactmentReference:
    string;

  constructor(
    options:
      FederalAccountabilityManagerOptions,
  ) {
    validateNarrative(
      options.organizationId,
      "organizationId",
    );
    validateNarrative(
      options.operatorToken,
      "operatorToken",
    );
    validateNarrative(
      options.enactmentReference,
      "enactmentReference",
    );

    this.enactmentAt =
      normalizeDateTime(
        options.enactmentAt,
        "enactmentAt",
      );
    this.enactmentReference =
      options.enactmentReference
        .trim();

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

    this.oversight =
      new FederalOversightManager({
        ...options,
        enactmentAt:
          this.enactmentAt,
        enactmentReference:
          this.enactmentReference,
      });
  }

  async syncFindingsFromFailedCheck(
    checkId: string,
    correlationId?:
      string | null,
  ): Promise<Finding[]> {
    validateIdentifier(
      checkId,
      "checkId",
    );

    return (
      await this.client
        .syncFailedCheckFindings(
          checkId,
          correlationId,
        )
    ).findings;
  }

  async getFinding(
    findingId: string,
  ): Promise<FindingView> {
    validateIdentifier(
      findingId,
      "findingId",
    );
    return this.client
      .getFinding(
        findingId,
      );
  }

  async listFindingsForResource(
    resourceId: string,
    status?:
      Finding["status"],
  ): Promise<Finding[]> {
    validateIdentifier(
      resourceId,
      "resourceId",
    );

    return this.client
      .listFindingsForResource(
        resourceId,
        status === undefined
          ? {}
          : { status },
      );
  }

  async assignFindingOwner(
    findingId: string,
    principalId: string,
    ownerPrincipalId:
      string | null,
    correlationId?:
      string | null,
  ): Promise<FindingView> {
    validateIdentifier(
      findingId,
      "findingId",
    );
    validateIdentifier(
      principalId,
      "principalId",
    );
    if (
      ownerPrincipalId !==
        null
    ) {
      validateIdentifier(
        ownerPrincipalId,
        "ownerPrincipalId",
      );
    }

    return this.client
      .assignFindingOwner(
        findingId,
        {
          principalId,
          ownerPrincipalId,
          correlationId,
        },
      );
  }

  async acknowledgeFinding(
    findingId: string,
    input:
      RemediationActionInput,
  ): Promise<FindingView> {
    validateAction(
      findingId,
      input.principalId,
      "findingId",
    );
    return this.client
      .acknowledgeFinding(
        findingId,
        input,
      );
  }

  async disputeFinding(
    findingId: string,
    input:
      RemediationActionInput & {
        reason: string;
      },
  ): Promise<FindingView> {
    validateAction(
      findingId,
      input.principalId,
      "findingId",
    );
    validateNarrative(
      input.reason,
      "reason",
    );

    return this.client
      .disputeFinding(
        findingId,
        input,
      );
  }

  async resolveFindingDispute(
    findingId: string,
    input:
      RemediationActionInput & {
        outcome:
          | "uphold"
          | "dismiss";
        rationale: string;
      },
  ): Promise<FindingView> {
    validateAction(
      findingId,
      input.principalId,
      "findingId",
    );
    validateNarrative(
      input.rationale,
      "rationale",
    );

    return this.client
      .resolveFindingDispute(
        findingId,
        input,
      );
  }

  async createRemediation(
    findingId: string,
    input:
      CreateFederalRemediationInput,
  ): Promise<FindingView> {
    validateIdentifier(
      findingId,
      "findingId",
    );
    validateIdentifier(
      input.createdByPrincipalId,
      "createdByPrincipalId",
    );
    validateNarrative(
      input.plan,
      "plan",
    );

    if (
      input.ownerPrincipalId
    ) {
      validateIdentifier(
        input.ownerPrincipalId,
        "ownerPrincipalId",
      );
    }

    if (
      input.kind ===
        "omb-corrective-action"
    ) {
      validateNarrative(
        input.correctiveActionPlanReference,
        "correctiveActionPlanReference",
      );
      validateIdentifier(
        input.milestoneId,
        "milestoneId",
      );
      validateIdentifier(
        input.oversightDeadlineId,
        "oversightDeadlineId",
      );

      return this.client
        .createRemediation(
          findingId,
          {
            createdByPrincipalId:
              input.createdByPrincipalId,
            ownerPrincipalId:
              input.ownerPrincipalId,
            plan:
              input.plan,
            metadata:
              this.metadata(
                "Sec. 6(b)(1)",
                "omb-corrective-action-remediation",
                {
                  correctiveActionPlanReference:
                    input
                      .correctiveActionPlanReference,
                  milestoneId:
                    input.milestoneId,
                  oversightDeadlineId:
                    input
                      .oversightDeadlineId,
                  deadlineOwnership:
                    "fdea-oversight-clock",
                },
              ),
            correlationId:
              input.correlationId,
          },
        );
    }

    const dueAt =
      input.dueAt ===
        undefined ||
      input.dueAt === null
        ? input.dueAt
        : normalizeDateTime(
            input.dueAt,
            "dueAt",
          );

    return this.client
      .createRemediation(
        findingId,
        {
          createdByPrincipalId:
            input.createdByPrincipalId,
          ownerPrincipalId:
            input.ownerPrincipalId,
          plan:
            input.plan,
          dueAt,
          warningWindowSeconds:
            input.warningWindowSeconds,
          gracePeriodSeconds:
            input.gracePeriodSeconds ??
            0,
          escalationAfterSeconds:
            input
              .escalationAfterSeconds,
          metadata:
            this.metadata(
              input.authorityReference ??
                "Sec. 6(a)",
              "agency-remediation",
              {
                deadlineOwnership:
                  dueAt
                    ? "generic-remediation-deadline"
                    : "none",
              },
            ),
          correlationId:
            input.correlationId,
        },
      );
  }

  async startRemediation(
    remediationId: string,
    input:
      RemediationActionInput,
  ): Promise<FindingView> {
    validateAction(
      remediationId,
      input.principalId,
      "remediationId",
    );
    return this.client
      .startRemediation(
        remediationId,
        input,
      );
  }

  async submitRemediationForVerification(
    remediationId: string,
    input:
      RemediationActionInput,
  ): Promise<FindingView> {
    validateAction(
      remediationId,
      input.principalId,
      "remediationId",
    );
    return this.client
      .submitRemediationForVerification(
        remediationId,
        input,
      );
  }

  async verifyRemediation(
    remediationId: string,
    input:
      VerifyFederalRemediationInput,
  ): Promise<FindingView> {
    validateAction(
      remediationId,
      input.principalId,
      "remediationId",
    );
    return this.client
      .verifyRemediation(
        remediationId,
        input,
      );
  }

  async rejectRemediation(
    remediationId: string,
    input:
      RemediationActionInput & {
        reason: string;
      },
  ): Promise<FindingView> {
    validateAction(
      remediationId,
      input.principalId,
      "remediationId",
    );
    validateNarrative(
      input.reason,
      "reason",
    );
    return this.client
      .rejectRemediation(
        remediationId,
        input,
      );
  }

  async cancelRemediation(
    remediationId: string,
    input:
      RemediationActionInput & {
        reason: string;
      },
  ): Promise<FindingView> {
    validateAction(
      remediationId,
      input.principalId,
      "remediationId",
    );
    validateNarrative(
      input.reason,
      "reason",
    );
    return this.client
      .cancelRemediation(
        remediationId,
        input,
      );
  }

  async completeOmbMilestoneFromVerifiedRemediation(
    input:
      CompleteOmbMilestoneInput,
  ): Promise<void> {
    validateIdentifier(
      input.findingId,
      "findingId",
    );
    validateIdentifier(
      input.remediationId,
      "remediationId",
    );
    validateIdentifier(
      input.oversightDeadlineId,
      "oversightDeadlineId",
    );
    validateIdentifier(
      input.principalId,
      "principalId",
    );

    const view =
      await this.client
        .getFinding(
          input.findingId,
        );
    const remediation =
      view.remediations.find(
        (candidate) =>
          candidate.id ===
            input.remediationId,
      );

    if (!remediation) {
      throw new Error(
        "remediation does not belong to the supplied finding",
      );
    }

    if (
      remediation.status !==
        "verified"
    ) {
      throw new Error(
        "OMB milestone deadline can only be completed from a verified remediation",
      );
    }

    const linkedDeadlineId =
      nestedString(
        remediation.metadata,
        "federalEncryption",
        "oversightDeadlineId",
      );

    if (
      linkedDeadlineId !==
        input.oversightDeadlineId
    ) {
      throw new Error(
        "verified remediation is not linked to the supplied OMB oversight deadline",
      );
    }

    await this
      .satisfyOversightDeadlineIfNeeded(
        input.oversightDeadlineId,
        input.principalId,
        input.satisfiedAt,
        input.correlationId,
      );
  }

  async issueSystemComplianceCertification(
    input:
      SystemCertificationInput,
  ): Promise<CertificationView> {
    validateSystemCertificationInput(
      input,
    );

    return this.client
      .issueCertification({
        resourceId:
          input.resourceId,
        supportingCheckId:
          input.supportingCheckId,
        certificationType:
          "fdea.system-compliance",
        issuedByPrincipalId:
          input.issuedByPrincipalId,
        validFrom:
          normalizeOptionalDate(
            input.validFrom,
            "validFrom",
          ),
        validUntil:
          normalizeOptionalDate(
            input.validUntil,
            "validUntil",
          ),
        validitySeconds:
          input.validitySeconds,
        criteria: {
          ruleSetId:
            input.ruleSetId,
          ruleSetVersion:
            input.ruleSetVersion,
          maximumCheckAgeSeconds:
            input
              .maximumCheckAgeSeconds,
          blockingFindingSeverities:
            [
              ...ALL_FINDING_SEVERITIES,
            ],
          materialFailureSeverities:
            [
              "high",
              "critical",
            ],
        },
        conditions:
          this.metadata(
            "Secs. 4-5",
            "system-compliance-certification",
            {
              statutoryAnnualFiling:
                false,
              positiveCertification:
                true,
            },
          ),
        metadata:
          {
            ...(
              input.metadata ??
              {}
            ),
            federalEncryption: {
              sourceDocument:
                SOURCE_DOCUMENT,
              sourceStatus:
                "enacted",
              section:
                "Secs. 4-5",
              obligation:
                "system-compliance-certification",
              enactmentAt:
                this.enactmentAt,
              enactmentReference:
                this
                  .enactmentReference,
              statutoryAnnualFiling:
                false,
              validityMeaning:
                "operational-window-supplied-by-caller",
            },
          },
        correlationId:
          input.correlationId,
      });
  }

  async renewSystemComplianceCertification(
    certificationId: string,
    input:
      RenewSystemCertificationInput,
  ): Promise<CertificationView> {
    validateIdentifier(
      certificationId,
      "certificationId",
    );
    validateRenewalInput(
      input,
    );

    return this.client
      .renewCertification(
        certificationId,
        {
          supportingCheckId:
            input.supportingCheckId,
          issuedByPrincipalId:
            input.issuedByPrincipalId,
          validFrom:
            normalizeOptionalDate(
              input.validFrom,
              "validFrom",
            ),
          validUntil:
            normalizeOptionalDate(
              input.validUntil,
              "validUntil",
            ),
          validitySeconds:
            input.validitySeconds,
          criteria: {
            ruleSetId:
              input.ruleSetId,
            ruleSetVersion:
              input.ruleSetVersion,
            maximumCheckAgeSeconds:
              input
                .maximumCheckAgeSeconds,
            blockingFindingSeverities:
              [
                ...ALL_FINDING_SEVERITIES,
              ],
            materialFailureSeverities:
              [
                "high",
                "critical",
              ],
          },
          metadata:
            {
              ...(
                input.metadata ??
                {}
              ),
              federalEncryption: {
                sourceDocument:
                  SOURCE_DOCUMENT,
                sourceStatus:
                  "enacted",
                section:
                  "Secs. 4-5",
                obligation:
                  "system-compliance-certification-renewal",
                enactmentAt:
                  this.enactmentAt,
                enactmentReference:
                  this
                    .enactmentReference,
                statutoryAnnualFiling:
                  false,
              },
            },
          correlationId:
            input.correlationId,
        },
      );
  }

  async suspendSystemCertification(
    certificationId: string,
    input:
      CertificationActionInput,
  ): Promise<CertificationView> {
    validateCertificationAction(
      certificationId,
      input,
    );
    return this.client
      .suspendCertification(
        certificationId,
        input,
      );
  }

  async reinstateSystemCertification(
    certificationId: string,
    input:
      ReinstateSystemCertificationInput,
  ): Promise<CertificationView> {
    validateIdentifier(
      certificationId,
      "certificationId",
    );
    validateIdentifier(
      input.supportingCheckId,
      "supportingCheckId",
    );
    validateIdentifier(
      input.principalId,
      "principalId",
    );
    validateNarrative(
      input.rationale,
      "rationale",
    );
    return this.client
      .reinstateCertification(
        certificationId,
        input,
      );
  }

  async revokeSystemCertification(
    certificationId: string,
    input:
      CertificationActionInput,
  ): Promise<CertificationView> {
    validateCertificationAction(
      certificationId,
      input,
    );
    return this.client
      .revokeCertification(
        certificationId,
        input,
      );
  }

  async submitAnnualCertificationFiling(
    input:
      SubmitAnnualCertificationInput,
  ): Promise<
    AnnualCertificationSubmission
  > {
    validateIdentifier(
      input.annualDeadlineId,
      "annualDeadlineId",
    );

    const report =
      buildAnnualCertificationReport(
        input,
      );
    this.assertAtOrAfterEnactment(
      report.submittedAt,
      "submittedAt",
    );

    const filing =
      await this.ensureFilingResource(
        "fdea-annual-certification-filing",
        "fdea:s6:annual:" +
          report.agencyResourceId +
          ":" +
          report.reportingYear,
        "FDEA Section 6 annual certification filing " +
          report.reportingYear,
        report,
        "Sec. 6(a)",
        "annual-certification-filing",
      );

    let nextQuarterlyDeadline =
      null;

    if (
      !report.fullCompliance
    ) {
      nextQuarterlyDeadline =
        await this.oversight
          .scheduleQuarterlyNoncomplianceUpdate(
            {
              agencyResourceId:
                report
                  .agencyResourceId,
              previousReportAt:
                report.submittedAt,
              sequence: 1,
              noncomplianceReference:
                filing.id,
              createdByPrincipalId:
                report
                  .certifyingPrincipalId,
              correlationId:
                input.correlationId,
            },
          );
    }

    await this
      .satisfyOversightDeadlineIfNeeded(
        input.annualDeadlineId,
        report
          .certifyingPrincipalId,
        report.submittedAt,
        input.correlationId,
      );

    return {
      report,
      filing,
      nextQuarterlyDeadline,
    };
  }

  async submitQuarterlyProgressUpdate(
    input:
      SubmitQuarterlyProgressInput,
  ): Promise<
    QuarterlyProgressSubmission
  > {
    validateIdentifier(
      input.quarterlyDeadlineId,
      "quarterlyDeadlineId",
    );

    const report =
      buildQuarterlyProgressReport(
        input,
      );
    this.assertAtOrAfterEnactment(
      report.submittedAt,
      "submittedAt",
    );

    const filing =
      await this.ensureFilingResource(
        "fdea-quarterly-progress-update",
        "fdea:s6:quarterly:" +
          report.agencyResourceId +
          ":" +
          report
            .rootNoncomplianceReference +
          ":" +
          report.sequence,
        "FDEA Section 6 quarterly progress update " +
          report.sequence,
        report,
        "Sec. 6(a)",
        "quarterly-progress-update",
      );

    let nextQuarterlyDeadline =
      null;

    if (
      !report.fullCompliance
    ) {
      nextQuarterlyDeadline =
        await this.oversight
          .scheduleQuarterlyNoncomplianceUpdate(
            {
              agencyResourceId:
                report
                  .agencyResourceId,
              previousReportAt:
                report.submittedAt,
              sequence:
                report.sequence +
                1,
              noncomplianceReference:
                report
                  .rootNoncomplianceReference,
              createdByPrincipalId:
                report
                  .submittedByPrincipalId,
              correlationId:
                input.correlationId,
            },
          );
    }

    await this
      .satisfyOversightDeadlineIfNeeded(
        input.quarterlyDeadlineId,
        report
          .submittedByPrincipalId,
        report.submittedAt,
        input.correlationId,
      );

    return {
      report,
      filing,
      nextQuarterlyDeadline,
    };
  }

  private async ensureFilingResource(
    resourceType: string,
    externalRef: string,
    name: string,
    report: unknown,
    section: string,
    obligation: string,
  ): Promise<Resource> {
    const contentHash =
      sha256(report);
    const existing =
      (
        await this.client
          .listResources({
            resourceType,
          })
      ).filter(
        (resource) =>
          resource.externalRef ===
            externalRef,
      );

    if (
      existing.length > 1
    ) {
      throw new Error(
        "multiple statutory filing resources already exist for the same external reference",
      );
    }

    const current =
      existing[0];

    if (current) {
      const existingHash =
        nestedString(
          current.metadata,
          "federalEncryption",
          "contentHash",
        );

      if (
        existingHash !==
          contentHash
      ) {
        throw new Error(
          "a statutory filing already exists with different content; file an explicit amendment rather than silently rewriting it",
        );
      }

      return current;
    }

    return this.client
      .createResource({
        resourceType,
        name,
        externalRef,
        status: "active",
        attributes: {
          report:
            toJsonObject(
              report,
            ),
        },
        metadata:
          this.metadata(
            section,
            obligation,
            {
              contentHash,
              immutableFilingIntent:
                true,
            },
          ),
      });
  }

  private async satisfyOversightDeadlineIfNeeded(
    deadlineId: string,
    principalId: string,
    satisfiedAt:
      string | undefined,
    correlationId?:
      string | null,
  ): Promise<void> {
    const status =
      await this.oversight
        .getOversightDeadlineStatus(
          deadlineId,
        );

    if (
      status.status ===
        "satisfied"
    ) {
      return;
    }

    if (
      status.status ===
        "cancelled"
    ) {
      throw new Error(
        "cancelled oversight deadline cannot be satisfied",
      );
    }

    await this.oversight
      .completeOversightDeadline(
        deadlineId,
        {
          principalId,
          satisfiedAt:
            satisfiedAt ===
              undefined
              ? undefined
              : normalizeDateTime(
                  satisfiedAt,
                  "satisfiedAt",
                ),
          correlationId,
        },
      );
  }

  private assertAtOrAfterEnactment(
    value: string,
    field: string,
  ): void {
    if (
      new Date(value)
        .getTime() <
      new Date(
        this.enactmentAt,
      ).getTime()
    ) {
      throw new Error(
        field +
          " cannot precede the confirmed enactment timestamp",
      );
    }
  }

  private metadata(
    section: string,
    obligation: string,
    extra:
      Record<
        string,
        string | number | boolean | null
      > = {},
  ): JsonObject {
    return {
      federalEncryption: {
        sourceDocument:
          SOURCE_DOCUMENT,
        sourceStatus:
          "enacted",
        section,
        obligation,
        enactmentAt:
          this.enactmentAt,
        enactmentReference:
          this.enactmentReference,
        ...extra,
      },
    };
  }
}

function validateAction(
  subjectId: string,
  principalId: string,
  subjectField: string,
): void {
  validateIdentifier(
    subjectId,
    subjectField,
  );
  validateIdentifier(
    principalId,
    "principalId",
  );
}

function validateCertificationAction(
  certificationId: string,
  input:
    CertificationActionInput,
): void {
  validateIdentifier(
    certificationId,
    "certificationId",
  );
  validateIdentifier(
    input.principalId,
    "principalId",
  );
  validateNarrative(
    input.reason,
    "reason",
  );
}

function validateSystemCertificationInput(
  input:
    SystemCertificationInput,
): void {
  validateIdentifier(
    input.resourceId,
    "resourceId",
  );
  validateRenewalInput(
    input,
  );
}

function validateRenewalInput(
  input:
    RenewSystemCertificationInput,
): void {
  validateIdentifier(
    input.supportingCheckId,
    "supportingCheckId",
  );
  validateIdentifier(
    input.issuedByPrincipalId,
    "issuedByPrincipalId",
  );

  const hasUntil =
    input.validUntil !==
      undefined;
  const hasSeconds =
    input.validitySeconds !==
      undefined;

  if (
    hasUntil === hasSeconds
  ) {
    throw new Error(
      "provide exactly one of validUntil or validitySeconds",
    );
  }

  if (
    input.validitySeconds !==
      undefined &&
    (
      !Number.isSafeInteger(
        input.validitySeconds,
      ) ||
      input.validitySeconds < 1
    )
  ) {
    throw new Error(
      "validitySeconds must be a positive safe integer",
    );
  }

  if (
    input.maximumCheckAgeSeconds !==
      undefined &&
    (
      !Number.isSafeInteger(
        input.maximumCheckAgeSeconds,
      ) ||
      input.maximumCheckAgeSeconds <
        1
    )
  ) {
    throw new Error(
      "maximumCheckAgeSeconds must be a positive safe integer",
    );
  }
}

function normalizeOptionalDate(
  value:
    | string
    | undefined,
  field: string,
): string | undefined {
  return value === undefined
    ? undefined
    : normalizeDateTime(
        value,
        field,
      );
}

function nestedString(
  object: JsonObject,
  group: string,
  key: string,
): string | null {
  const raw =
    object[group];

  if (
    raw === null ||
    typeof raw !==
      "object" ||
    Array.isArray(raw)
  ) {
    return null;
  }

  const value =
    (
      raw as Record<
        string,
        unknown
      >
    )[key];

  return typeof value ===
    "string"
    ? value
    : null;
}

function sha256(
  value: unknown,
): string {
  return createHash(
    "sha256",
  )
    .update(
      JSON.stringify(
        canonicalize(value),
      ),
    )
    .digest("hex");
}

function canonicalize(
  value: unknown,
): unknown {
  if (
    Array.isArray(value)
  ) {
    return value.map(
      canonicalize,
    );
  }

  if (
    value !== null &&
    typeof value ===
      "object"
  ) {
    const result:
      Record<string, unknown> =
      {};

    for (
      const key of
      Object.keys(
        value as Record<
          string,
          unknown
        >,
      ).sort()
    ) {
      const item =
        (
          value as Record<
            string,
            unknown
          >
        )[key];

      if (
        item !== undefined
      ) {
        result[key] =
          canonicalize(item);
      }
    }

    return result;
  }

  return value;
}

function toJsonObject(
  value: unknown,
): JsonObject {
  const parsed =
    JSON.parse(
      JSON.stringify(
        canonicalize(value),
      ),
    ) as unknown;

  if (
    parsed === null ||
    typeof parsed !==
      "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "filing report must serialize to an object",
    );
  }

  return parsed as JsonObject;
}

function validateIdentifier(
  value: string,
  field: string,
): void {
  validateNarrative(
    value,
    field,
  );

  if (
    value.trim().length >
      512
  ) {
    throw new Error(
      field +
        " is too long",
    );
  }
}

function validateNarrative(
  value: string,
  field: string,
): void {
  if (
    typeof value !==
      "string" ||
    value.trim() ===
      ""
  ) {
    throw new Error(
      field +
        " is required",
    );
  }
}
