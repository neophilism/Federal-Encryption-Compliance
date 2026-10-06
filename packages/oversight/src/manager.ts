import {
  createOperatorClient,
  type ComplianceEngineClient,
  type CreateDeadlineInput,
  type Deadline,
  type DeadlineStatusSnapshot,
  type DeadlineView,
} from "@caiae/sdk";
import {
  calculateStatutoryEnactmentDates,
  nextQuarterlyUpdateDueAt,
  normalizeDateTime,
  validateAnnualDueAt,
} from "./dates.js";
import type {
  AnnualCertificationScheduleInput,
  CompleteOversightDeadlineInput,
  EnactmentClockProvisionInput,
  FederalOversightManagerOptions,
  InspectorGeneralReviewScheduleInput,
  OmbCorrectiveActionMilestoneInput,
  ProvisionedEnactmentClocks,
  QuarterlyProgressScheduleInput,
} from "./types.js";

const SOURCE_DOCUMENT =
  "Federal Data Encryption Act of 2025";

export class FederalOversightManager {
  private readonly client:
    ComplianceEngineClient;
  private readonly enactmentAt:
    string;
  private readonly enactmentReference:
    string;

  constructor(
    options:
      FederalOversightManagerOptions,
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
  }

  async provisionEnactmentClocks(
    input:
      EnactmentClockProvisionInput,
  ): Promise<
    ProvisionedEnactmentClocks
  > {
    validateNarrative(
      input.createdByPrincipalId,
      "createdByPrincipalId",
    );
    const agencyResourceIds =
      validateUniqueIdentifiers(
        input.agencyResourceIds ??
          [],
        "agencyResourceIds",
      );
    const contractorResourceIds =
      validateUniqueIdentifiers(
        input.existingContractorResourceIds ??
          [],
        "existingContractorResourceIds",
      );
    const dates =
      calculateStatutoryEnactmentDates(
        this.enactmentAt,
      );

    const nistGuidance =
      await this.ensureDeadline({
        subjectType:
          "fdea-governmentwide-obligation",
        subjectId:
          "nist-guidance",
        deadlineType:
          "fdea.s4.nist-guidance",
        createdByPrincipalId:
          input.createdByPrincipalId,
        dueAt:
          dates.nistGuidanceDueAt,
        gracePeriodSeconds:
          0,
        metadata:
          this.metadata(
            "Sec. 4(b)",
            "nist-guidance",
            {
              calculation:
                "180-days-after-enactment",
            },
          ),
        correlationId:
          input.correlationId,
      });

    const agencyImplementation =
      await Promise.all(
        agencyResourceIds.map(
          (resourceId) =>
            this.ensureDeadline({
              resourceId,
              subjectType:
                "fdea-agency-implementation",
              subjectId:
                resourceId,
              deadlineType:
                "fdea.s4.agency-implementation",
              createdByPrincipalId:
                input.createdByPrincipalId,
              dueAt:
                dates.agencyImplementationDueAt,
              gracePeriodSeconds:
                0,
              metadata:
                this.metadata(
                  "Sec. 4(c)",
                  "agency-implementation",
                  {
                    calculation:
                      "one-calendar-year-after-enactment",
                    waiverSection:
                      "Sec. 7",
                  },
                ),
              correlationId:
                input.correlationId,
            }),
        ),
      );

    const existingContractTransitions =
      await Promise.all(
        contractorResourceIds.map(
          (resourceId) =>
            this.ensureDeadline({
              resourceId,
              subjectType:
                "fdea-existing-contract-transition",
              subjectId:
                resourceId,
              deadlineType:
                "fdea.s5.existing-contract-transition",
              createdByPrincipalId:
                input.createdByPrincipalId,
              dueAt:
                dates.existingContractTransitionDueAt,
              gracePeriodSeconds:
                0,
              metadata:
                this.metadata(
                  "Sec. 5(a)",
                  "existing-contract-transition",
                  {
                    calculation:
                      "maximum-one-calendar-year-after-enactment",
                    statutoryCharacter:
                      "outer-limit",
                  },
                ),
              correlationId:
                input.correlationId,
            }),
        ),
      );

    const gaoEvaluation =
      await this.ensureDeadline({
        subjectType:
          "fdea-governmentwide-obligation",
        subjectId:
          "gao-evaluation",
        deadlineType:
          "fdea.s6.gao-evaluation",
        createdByPrincipalId:
          input.createdByPrincipalId,
        dueAt:
          dates.gaoEvaluationDueAt,
        gracePeriodSeconds:
          0,
        metadata:
          this.metadata(
            "Sec. 6(c)",
            "gao-evaluation",
            {
              calculation:
                "18-calendar-months-after-enactment",
            },
          ),
        correlationId:
          input.correlationId,
      });

    return {
      nistGuidance,
      agencyImplementation,
      existingContractTransitions,
      gaoEvaluation,
    };
  }

  async scheduleAnnualCertification(
    input:
      AnnualCertificationScheduleInput,
  ): Promise<DeadlineView> {
    validateIdentifier(
      input.agencyResourceId,
      "agencyResourceId",
    );
    validateNarrative(
      input.createdByPrincipalId,
      "createdByPrincipalId",
    );
    validateNarrative(
      input.ombDirectiveReference,
      "ombDirectiveReference",
    );

    const dueAt =
      validateAnnualDueAt(
        input.ombDueAt,
        input.reportingYear,
      );
    this.assertAtOrAfterEnactment(
      dueAt,
      "ombDueAt",
    );

    return this.ensureDeadline({
      resourceId:
        input.agencyResourceId,
      subjectType:
        "fdea-annual-certification",
      subjectId:
        input.agencyResourceId +
        ":" +
        input.reportingYear,
      deadlineType:
        "fdea.s6.annual-certification",
      createdByPrincipalId:
        input.createdByPrincipalId,
      dueAt,
      gracePeriodSeconds:
        0,
      metadata:
        this.metadata(
          "Sec. 6(a)",
          "annual-certification",
          {
            reportingYear:
              input.reportingYear,
            ombDirectiveReference:
              input.ombDirectiveReference,
            statutoryLatestDate:
              input.reportingYear +
              "-12-31",
            schedulingModel:
              "explicit-omb-date-per-year",
            fixedSecondRecurrence:
              false,
          },
        ),
      correlationId:
        input.correlationId,
    });
  }

  async scheduleQuarterlyNoncomplianceUpdate(
    input:
      QuarterlyProgressScheduleInput,
  ): Promise<DeadlineView> {
    validateIdentifier(
      input.agencyResourceId,
      "agencyResourceId",
    );
    validateNarrative(
      input.createdByPrincipalId,
      "createdByPrincipalId",
    );
    validateNarrative(
      input.noncomplianceReference,
      "noncomplianceReference",
    );

    if (
      !Number.isInteger(
        input.sequence,
      ) ||
      input.sequence < 1
    ) {
      throw new Error(
        "sequence must be a positive integer",
      );
    }

    const previousReportAt =
      normalizeDateTime(
        input.previousReportAt,
        "previousReportAt",
      );
    this.assertAtOrAfterEnactment(
      previousReportAt,
      "previousReportAt",
    );
    const dueAt =
      nextQuarterlyUpdateDueAt(
        previousReportAt,
      );

    return this.ensureDeadline({
      resourceId:
        input.agencyResourceId,
      subjectType:
        "fdea-quarterly-progress-update",
      subjectId:
        input.agencyResourceId +
        ":" +
        input.noncomplianceReference +
        ":" +
        input.sequence,
      deadlineType:
        "fdea.s6.quarterly-progress-update",
      createdByPrincipalId:
        input.createdByPrincipalId,
      dueAt,
      gracePeriodSeconds:
        0,
      metadata:
        this.metadata(
          "Sec. 6(a)",
          "quarterly-progress-update",
          {
            previousReportAt,
            sequence:
              input.sequence,
            noncomplianceReference:
              input.noncomplianceReference,
            calculation:
              "three-calendar-months-after-previous-report",
            continueUntil:
              "full-compliance",
            fixedSecondRecurrence:
              false,
          },
        ),
      correlationId:
        input.correlationId,
    });
  }

  async scheduleOmbCorrectiveActionMilestone(
    input:
      OmbCorrectiveActionMilestoneInput,
  ): Promise<DeadlineView> {
    validateIdentifier(
      input.agencyResourceId,
      "agencyResourceId",
    );
    validateNarrative(
      input.createdByPrincipalId,
      "createdByPrincipalId",
    );
    validateNarrative(
      input.correctiveActionPlanReference,
      "correctiveActionPlanReference",
    );
    validateIdentifier(
      input.milestoneId,
      "milestoneId",
    );
    validateNarrative(
      input.milestoneDescription,
      "milestoneDescription",
    );

    const dueAt =
      normalizeDateTime(
        input.dueAt,
        "dueAt",
      );
    this.assertAtOrAfterEnactment(
      dueAt,
      "dueAt",
    );

    return this.ensureDeadline({
      resourceId:
        input.agencyResourceId,
      subjectType:
        "fdea-omb-corrective-action",
      subjectId:
        input.agencyResourceId +
        ":" +
        input.correctiveActionPlanReference +
        ":" +
        input.milestoneId,
      deadlineType:
        "fdea.s6.omb-corrective-action-milestone",
      createdByPrincipalId:
        input.createdByPrincipalId,
      dueAt,
      gracePeriodSeconds:
        0,
      metadata:
        this.metadata(
          "Sec. 6(b)(1)",
          "omb-corrective-action-milestone",
          {
            correctiveActionPlanReference:
              input.correctiveActionPlanReference,
            milestoneId:
              input.milestoneId,
            milestoneDescription:
              input.milestoneDescription,
            dueDateSource:
              "OMB-approved-corrective-action-plan",
          },
        ),
      correlationId:
        input.correlationId,
    });
  }

  async scheduleInspectorGeneralReview(
    input:
      InspectorGeneralReviewScheduleInput,
  ): Promise<DeadlineView> {
    validateIdentifier(
      input.agencyResourceId,
      "agencyResourceId",
    );
    validateIdentifier(
      input.reviewId,
      "reviewId",
    );
    validateNarrative(
      input.reviewFrameworkReference,
      "reviewFrameworkReference",
    );
    validateNarrative(
      input.createdByPrincipalId,
      "createdByPrincipalId",
    );

    const dueAt =
      normalizeDateTime(
        input.dueAt,
        "dueAt",
      );
    this.assertAtOrAfterEnactment(
      dueAt,
      "dueAt",
    );

    return this.ensureDeadline({
      resourceId:
        input.agencyResourceId,
      subjectType:
        "fdea-inspector-general-review",
      subjectId:
        input.agencyResourceId +
        ":" +
        input.reviewId,
      deadlineType:
        "fdea.s6.inspector-general-review",
      createdByPrincipalId:
        input.createdByPrincipalId,
      dueAt,
      gracePeriodSeconds:
        0,
      metadata:
        this.metadata(
          "Sec. 6(d)",
          "inspector-general-review",
          {
            reviewId:
              input.reviewId,
            reviewFrameworkReference:
              input.reviewFrameworkReference,
            schedulingModel:
              "explicit-existing-periodic-or-fisma-review-date",
            inventedStatutoryInterval:
              false,
          },
        ),
      correlationId:
        input.correlationId,
    });
  }

  async getOversightDeadline(
    deadlineId: string,
  ): Promise<DeadlineView> {
    validateIdentifier(
      deadlineId,
      "deadlineId",
    );
    return this.client
      .getDeadline(
        deadlineId,
      );
  }

  async getOversightDeadlineStatus(
    deadlineId: string,
    at?: string,
  ): Promise<
    DeadlineStatusSnapshot
  > {
    validateIdentifier(
      deadlineId,
      "deadlineId",
    );
    const normalizedAt =
      at === undefined
        ? undefined
        : normalizeDateTime(
            at,
            "at",
          );

    return this.client
      .getDeadlineStatus(
        deadlineId,
        normalizedAt,
      );
  }

  async listOversightDeadlines(
    subjectType: string,
    subjectId: string,
  ): Promise<Deadline[]> {
    validateIdentifier(
      subjectType,
      "subjectType",
    );
    validateIdentifier(
      subjectId,
      "subjectId",
    );

    return this.client
      .listDeadlinesBySubject(
        subjectType,
        subjectId,
      );
  }

  async completeOversightDeadline(
    deadlineId: string,
    input:
      CompleteOversightDeadlineInput,
  ): Promise<DeadlineView> {
    validateIdentifier(
      deadlineId,
      "deadlineId",
    );
    validateNarrative(
      input.principalId,
      "principalId",
    );

    return this.client
      .satisfyDeadline(
        deadlineId,
        {
          principalId:
            input.principalId,
          satisfiedAt:
            input.satisfiedAt ===
              undefined
              ? undefined
              : normalizeDateTime(
                  input.satisfiedAt,
                  "satisfiedAt",
                ),
          correlationId:
            input.correlationId,
        },
      );
  }

  private async ensureDeadline(
    input:
      CreateDeadlineInput,
  ): Promise<DeadlineView> {
    if (
      input.dueAt ===
        undefined
    ) {
      throw new Error(
        "Federal oversight deadlines require an explicit dueAt",
      );
    }

    const expectedDueAt =
      normalizeDateTime(
        input.dueAt,
        "dueAt",
      );
    const existing =
      (
        await this.client
          .listDeadlinesBySubject(
            input.subjectType,
            input.subjectId,
          )
      ).filter(
        (deadline) =>
          deadline.deadlineType ===
            input.deadlineType &&
          deadline.status !==
            "cancelled",
      );

    if (
      existing.length > 1
    ) {
      throw new Error(
        "multiple active deadlines already exist for this Federal oversight obligation",
      );
    }

    const current =
      existing[0];

    if (current) {
      const currentDueAt =
        normalizeDateTime(
          current.dueAt,
          "existing dueAt",
        );

      if (
        currentDueAt !==
        expectedDueAt
      ) {
        throw new Error(
          "an active deadline already exists for this obligation with a different dueAt; correct or supersede it explicitly rather than silently changing a statutory clock",
        );
      }

      return this.client
        .getDeadline(
          current.id,
        );
    }

    return this.client
      .createDeadline({
        ...input,
        dueAt:
          expectedDueAt,
      });
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
  ) {
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

function validateUniqueIdentifiers(
  values: string[],
  field: string,
): string[] {
  const normalized =
    values.map(
      (value, index) => {
        validateIdentifier(
          value,
          field +
            "[" +
            index +
            "]",
        );
        return value.trim();
      },
    );

  if (
    new Set(normalized)
      .size !==
    normalized.length
  ) {
    throw new Error(
      field +
        " must not contain duplicates",
    );
  }

  return normalized;
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
