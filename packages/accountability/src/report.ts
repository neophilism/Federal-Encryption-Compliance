import {
  normalizeDateTime,
} from "@federal-encryption/oversight";
import type {
  AgencyComplianceSummary,
  AnnualCertificationReport,
  AnnualCertificationReportInput,
  ComplianceAssessment,
  ComplianceMeasure,
  ContractorExternalAttestation,
  EncryptionIncident,
  QuarterlyProgressReport,
  QuarterlyProgressReportInput,
  RemediationMilestoneSummary,
  RemediationPlanSummary,
  SystemComplianceSnapshot,
} from "./types.js";

export function buildAnnualCertificationReport(
  input: AnnualCertificationReportInput,
): AnnualCertificationReport {
  validateIdentifier(
    input.agencyResourceId,
    "agencyResourceId",
  );
  validateReportingYear(
    input.reportingYear,
  );
  validateIdentifier(
    input.certifyingPrincipalId,
    "certifyingPrincipalId",
  );

  const submittedAt =
    normalizeDateTime(
      input.submittedAt,
      "submittedAt",
    );
  const incidentReportingPeriod = {
    startAt:
      normalizeDateTime(
        input.incidentReportingPeriod
          .startAt,
        "incidentReportingPeriod.startAt",
      ),
    endAt:
      normalizeDateTime(
        input.incidentReportingPeriod
          .endAt,
        "incidentReportingPeriod.endAt",
      ),
  };

  if (
    new Date(
      incidentReportingPeriod.startAt,
    ).getTime() >
    new Date(
      incidentReportingPeriod.endAt,
    ).getTime()
  ) {
    throw new Error(
      "incident reporting period start cannot be after its end",
    );
  }

  if (
    new Date(
      incidentReportingPeriod.endAt,
    ).getTime() >
    new Date(
      submittedAt,
    ).getTime()
  ) {
    throw new Error(
      "incident reporting period cannot end after submission",
    );
  }

  const systems =
    normalizeSystems(
      input.systems,
    );
  const compliance =
    summarizeCompliance(
      systems,
    );
  const attestation =
    normalizeAttestation(
      input
        .contractorExternalAttestation,
    );
  const incidents =
    normalizeIncidents(
      input.incidents,
    );
  const remediationPlans =
    normalizeRemediationPlans(
      input.remediationPlans,
    );
  const fullCompliance =
    compliance
      .noncompliantSystems
      .length === 0 &&
    attestation
      .attestedNoLoopholes;
  const explanation =
    normalizeOptionalNarrative(
      input.inabilityExplanation,
    );

  if (
    !fullCompliance &&
    explanation === null
  ) {
    throw new Error(
      "inabilityExplanation is required when full compliance cannot be certified",
    );
  }

  if (
    !fullCompliance &&
    remediationPlans.length ===
      0
  ) {
    throw new Error(
      "at least one remediation plan is required when full compliance cannot be certified",
    );
  }

  if (
    fullCompliance &&
    explanation !== null
  ) {
    throw new Error(
      "inabilityExplanation must be omitted when full compliance is certified",
    );
  }

  return {
    schemaVersion: "1",
    reportType:
      "fdea-section-6-annual-certification-filing",
    agencyResourceId:
      input.agencyResourceId.trim(),
    reportingYear:
      input.reportingYear,
    submittedAt,
    certifyingPrincipalId:
      input.certifyingPrincipalId
        .trim(),
    incidentReportingPeriod,
    compliance,
    supportingCheckIds:
      systems
        .filter(
          (system) =>
            system
              .handlesCoveredInformation,
        )
        .map(
          (system) =>
            system.supportingCheckId,
        ),
    incidents,
    remediationPlans,
    contractorExternalAttestation:
      attestation,
    fullCompliance,
    inabilityExplanation:
      fullCompliance
        ? null
        : explanation,
  };
}

export function buildQuarterlyProgressReport(
  input: QuarterlyProgressReportInput,
): QuarterlyProgressReport {
  validateIdentifier(
    input.agencyResourceId,
    "agencyResourceId",
  );
  validateIdentifier(
    input.rootNoncomplianceReference,
    "rootNoncomplianceReference",
  );
  validateIdentifier(
    input.submittedByPrincipalId,
    "submittedByPrincipalId",
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

  const submittedAt =
    normalizeDateTime(
      input.submittedAt,
      "submittedAt",
    );
  const systems =
    normalizeSystems(
      input.systems,
    );
  const compliance =
    summarizeCompliance(
      systems,
    );
  const attestation =
    normalizeAttestation(
      input
        .contractorExternalAttestation,
    );
  const remediationPlans =
    normalizeRemediationPlans(
      input.remediationPlans,
    );
  const progressNarrative =
    requireNarrative(
      input.progressNarrative,
      "progressNarrative",
    );
  const fullCompliance =
    compliance
      .noncompliantSystems
      .length === 0 &&
    attestation
      .attestedNoLoopholes;

  if (
    !fullCompliance &&
    remediationPlans.length ===
      0
  ) {
    throw new Error(
      "a continuing noncompliance update must include at least one remediation plan",
    );
  }

  return {
    schemaVersion: "1",
    reportType:
      "fdea-section-6-quarterly-progress-update",
    agencyResourceId:
      input.agencyResourceId.trim(),
    rootNoncomplianceReference:
      input.rootNoncomplianceReference
        .trim(),
    sequence:
      input.sequence,
    submittedAt,
    submittedByPrincipalId:
      input.submittedByPrincipalId
        .trim(),
    compliance,
    supportingCheckIds:
      systems
        .filter(
          (system) =>
            system
              .handlesCoveredInformation,
        )
        .map(
          (system) =>
            system.supportingCheckId,
        ),
    remediationPlans,
    contractorExternalAttestation:
      attestation,
    progressNarrative,
    fullCompliance,
  };
}

export function summarizeCompliance(
  input: SystemComplianceSnapshot[],
): AgencyComplianceSummary {
  const systems =
    normalizeSystems(input);
  const covered =
    systems.filter(
      (system) =>
        system
          .handlesCoveredInformation,
    );

  return {
    coveredSystems:
      covered.length,
    overall:
      measure(
        covered,
        (system) =>
          system.overallCompliance,
      ),
    encryptionInTransit:
      measure(
        covered,
        (system) =>
          system.transitEncryption,
      ),
    encryptionAtRest:
      measure(
        covered,
        (system) =>
          system.atRestEncryption,
      ),
    noncompliantSystems:
      covered
        .filter(
          (system) =>
            system.overallCompliance !==
              "pass" ||
            system.transitEncryption !==
              "pass" ||
            system.atRestEncryption !==
              "pass",
        )
        .map(
          (system) => ({
            resourceId:
              system.resourceId,
            name:
              system.name ?? null,
            category:
              system.category ??
              null,
            supportingCheckId:
              system.supportingCheckId,
            overallCompliance:
              system
                .overallCompliance,
            transitEncryption:
              system
                .transitEncryption,
            atRestEncryption:
              system
                .atRestEncryption,
            reasons:
              [
                ...(
                  system
                    .noncomplianceReasons ??
                  []
                ),
              ],
          }),
        ),
  };
}

function measure(
  systems:
    SystemComplianceSnapshot[],
  assessment:
    (
      system:
        SystemComplianceSnapshot,
    ) => ComplianceAssessment,
): ComplianceMeasure {
  const total =
    systems.length;
  const compliant =
    systems.filter(
      (system) =>
        assessment(system) ===
          "pass",
    ).length;

  return {
    compliant,
    total,
    percentage:
      total === 0
        ? null
        : Number(
            (
              (
                compliant /
                total
              ) *
              100
            ).toFixed(2),
          ),
  };
}

function normalizeSystems(
  input: SystemComplianceSnapshot[],
): SystemComplianceSnapshot[] {
  if (
    !Array.isArray(input)
  ) {
    throw new Error(
      "systems must be an array",
    );
  }

  const seen =
    new Set<string>();

  return input.map(
    (system, index) => {
      const prefix =
        "systems[" +
        index +
        "]";
      validateIdentifier(
        system.resourceId,
        prefix +
          ".resourceId",
      );
      validateIdentifier(
        system.supportingCheckId,
        prefix +
          ".supportingCheckId",
      );
      validateAssessment(
        system.overallCompliance,
        prefix +
          ".overallCompliance",
      );
      validateAssessment(
        system.transitEncryption,
        prefix +
          ".transitEncryption",
      );
      validateAssessment(
        system.atRestEncryption,
        prefix +
          ".atRestEncryption",
      );

      const resourceId =
        system.resourceId
          .trim();

      if (
        seen.has(resourceId)
      ) {
        throw new Error(
          "systems must not contain duplicate resourceId values",
        );
      }
      seen.add(resourceId);

      const reasons =
        (
          system
            .noncomplianceReasons ??
          []
        ).map(
          (reason, reasonIndex) =>
            requireNarrative(
              reason,
              prefix +
                ".noncomplianceReasons[" +
                reasonIndex +
                "]",
            ),
        );

      if (
        system
          .handlesCoveredInformation &&
        (
          system.overallCompliance !==
            "pass" ||
          system.transitEncryption !==
            "pass" ||
          system.atRestEncryption !==
            "pass"
        ) &&
        reasons.length === 0
      ) {
        throw new Error(
          prefix +
            " requires noncomplianceReasons when a covered system is not fully passing",
        );
      }

      return {
        ...system,
        resourceId,
        supportingCheckId:
          system
            .supportingCheckId
            .trim(),
        name:
          normalizeOptionalNarrative(
            system.name,
          ) ?? undefined,
        category:
          normalizeOptionalNarrative(
            system.category,
          ) ?? undefined,
        noncomplianceReasons:
          reasons,
      };
    },
  );
}

function normalizeAttestation(
  input:
    ContractorExternalAttestation,
): ContractorExternalAttestation {
  const narrative =
    requireNarrative(
      input.narrative,
      "contractorExternalAttestation.narrative",
    );
  const supportingReferences =
    input
      .supportingReferences
      .map(
        (
          reference,
          index,
        ) =>
          requireNarrative(
            reference,
            "contractorExternalAttestation.supportingReferences[" +
              index +
              "]",
          ),
      );

  if (
    supportingReferences.length ===
      0
  ) {
    throw new Error(
      "contractor/external-system attestation requires at least one supporting reference",
    );
  }

  return {
    attestedNoLoopholes:
      input
        .attestedNoLoopholes,
    narrative,
    supportingReferences,
  };
}

function normalizeIncidents(
  input: EncryptionIncident[],
): EncryptionIncident[] {
  const seen =
    new Set<string>();

  return input.map(
    (incident, index) => {
      const prefix =
        "incidents[" +
        index +
        "]";
      const incidentReference =
        requireNarrative(
          incident
            .incidentReference,
          prefix +
            ".incidentReference",
        );

      if (
        seen.has(
          incidentReference,
        )
      ) {
        throw new Error(
          "incident references must be unique",
        );
      }
      seen.add(
        incidentReference,
      );

      if (
        ![
          "in_transit",
          "at_rest",
          "both",
        ].includes(
          incident.exposure,
        )
      ) {
        throw new Error(
          prefix +
            ".exposure is invalid",
        );
      }

      const remedialActions =
        incident
          .remedialActions
          .map(
            (
              action,
              actionIndex,
            ) =>
              requireNarrative(
                action,
                prefix +
                  ".remedialActions[" +
                  actionIndex +
                  "]",
              ),
          );

      if (
        remedialActions.length ===
          0
      ) {
        throw new Error(
          prefix +
            " requires at least one remedial action",
        );
      }

      return {
        incidentReference,
        occurredAt:
          incident.occurredAt ===
            undefined
            ? undefined
            : normalizeDateTime(
                incident
                  .occurredAt,
                prefix +
                  ".occurredAt",
              ),
        discoveredAt:
          incident.discoveredAt ===
            undefined
            ? undefined
            : normalizeDateTime(
                incident
                  .discoveredAt,
                prefix +
                  ".discoveredAt",
              ),
        exposure:
          incident.exposure,
        description:
          requireNarrative(
            incident.description,
            prefix +
              ".description",
          ),
        remedialActions,
      };
    },
  );
}

function normalizeRemediationPlans(
  input:
    RemediationPlanSummary[],
): RemediationPlanSummary[] {
  const seen =
    new Set<string>();

  return input.map(
    (plan, index) => {
      const prefix =
        "remediationPlans[" +
        index +
        "]";
      const reference =
        requireNarrative(
          plan.reference,
          prefix +
            ".reference",
        );

      if (
        seen.has(reference)
      ) {
        throw new Error(
          "remediation plan references must be unique",
        );
      }
      seen.add(reference);

      if (
        plan.milestones
          .length === 0
      ) {
        throw new Error(
          prefix +
            " requires at least one milestone",
        );
      }

      return {
        reference,
        description:
          requireNarrative(
            plan.description,
            prefix +
              ".description",
          ),
        milestones:
          plan.milestones.map(
            (
              milestone,
              milestoneIndex,
            ) =>
              normalizeMilestone(
                milestone,
                prefix +
                  ".milestones[" +
                  milestoneIndex +
                  "]",
              ),
          ),
        expectedCompletionAt:
          plan
            .expectedCompletionAt ===
              undefined
            ? undefined
            : normalizeDateTime(
                plan
                  .expectedCompletionAt,
                prefix +
                  ".expectedCompletionAt",
              ),
        resourceNeeds:
          normalizeOptionalNarrative(
            plan.resourceNeeds,
          ) ?? undefined,
      };
    },
  );
}

function normalizeMilestone(
  input:
    RemediationMilestoneSummary,
  field: string,
): RemediationMilestoneSummary {
  if (
    ![
      "planned",
      "in_progress",
      "completed",
      "verified",
    ].includes(
      input.status,
    )
  ) {
    throw new Error(
      field +
        ".status is invalid",
    );
  }

  return {
    milestoneId:
      requireNarrative(
        input.milestoneId,
        field +
          ".milestoneId",
      ),
    description:
      requireNarrative(
        input.description,
        field +
          ".description",
      ),
    dueAt:
      input.dueAt ===
        undefined
        ? undefined
        : normalizeDateTime(
            input.dueAt,
            field +
              ".dueAt",
          ),
    status:
      input.status,
  };
}

function validateAssessment(
  value: ComplianceAssessment,
  field: string,
): void {
  if (
    ![
      "pass",
      "fail",
      "unknown",
      "not_applicable",
    ].includes(value)
  ) {
    throw new Error(
      field +
        " is invalid",
    );
  }
}

function validateReportingYear(
  value: number,
): void {
  if (
    !Number.isInteger(value) ||
    value < 1900 ||
    value > 9999
  ) {
    throw new Error(
      "reportingYear must be a four-digit year",
    );
  }
}

function validateIdentifier(
  value: string,
  field: string,
): void {
  const normalized =
    requireNarrative(
      value,
      field,
    );

  if (
    normalized.length >
      512
  ) {
    throw new Error(
      field +
        " is too long",
    );
  }
}

function requireNarrative(
  value: string,
  field: string,
): string {
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

  return value.trim();
}

function normalizeOptionalNarrative(
  value:
    | string
    | undefined,
): string | null {
  if (
    value === undefined
  ) {
    return null;
  }

  const normalized =
    value.trim();
  return normalized ===
    ""
    ? null
    : normalized;
}
