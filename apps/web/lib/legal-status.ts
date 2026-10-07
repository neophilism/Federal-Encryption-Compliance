export type FederalLegalStatus =
  | {
      mode: "draft";
      label: "Draft / simulation";
      detail: string;
      effectiveFrom: null;
      enactmentReference: null;
    }
  | {
      mode:
        "incomplete-enactment";
      label:
        "Enactment configuration incomplete";
      detail: string;
      effectiveFrom:
        string | null;
      enactmentReference:
        string | null;
    }
  | {
      mode: "enacted";
      label:
        "Enacted / live compliance";
      detail: string;
      effectiveFrom: string;
      enactmentReference: string;
    };

type LegalEnvironment = {
  FDEA_EFFECTIVE_FROM?: string;
  FDEA_ENACTMENT_REFERENCE?: string;
};

export function readFederalLegalStatus(
  env: LegalEnvironment =
    process.env as LegalEnvironment,
): FederalLegalStatus {
  const rawEffective =
    env.FDEA_EFFECTIVE_FROM
      ?.trim() ||
    null;
  const reference =
    env.FDEA_ENACTMENT_REFERENCE
      ?.trim() ||
    null;

  if (
    rawEffective === null &&
    reference === null
  ) {
    return {
      mode: "draft",
      label:
        "Draft / simulation",
      detail:
        "No enactment timestamp or authority reference is configured. The application must not represent the draft source as effective law.",
      effectiveFrom: null,
      enactmentReference:
        null,
    };
  }

  let effectiveFrom:
    string | null = null;

  if (rawEffective !== null) {
    const date =
      new Date(rawEffective);

    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      effectiveFrom =
        date.toISOString();
    }
  }

  if (
    effectiveFrom === null ||
    reference === null
  ) {
    return {
      mode:
        "incomplete-enactment",
      label:
        "Enactment configuration incomplete",
      detail:
        "Live legal mode requires both a valid FDEA_EFFECTIVE_FROM timestamp and FDEA_ENACTMENT_REFERENCE. Until both are present, the UI remains fail-closed.",
      effectiveFrom,
      enactmentReference:
        reference,
    };
  }

  return {
    mode: "enacted",
    label:
      "Enacted / live compliance",
    detail:
      "The application is operating with an explicit enactment/effective timestamp and authority reference.",
    effectiveFrom,
    enactmentReference:
      reference,
  };
}
