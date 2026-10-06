export type PolicyAuthorityReference = {
  authorityType: "draft-legislation";
  citation: string;
  title: string;
  locator: string;
  jurisdiction: "United States";
  effectiveFrom: null;
  effectiveTo: null;
  metadata: {
    sourceStatus: "draft";
    sourceDocument: string;
    section: string;
    purpose: string;
  };
};

const sourceDocument =
  "Federal Data Encryption Act of 2025";

function authority(
  section: string,
  purpose: string,
): PolicyAuthorityReference {
  return {
    authorityType:
      "draft-legislation",
    citation:
      sourceDocument + " § " +
      section.replace("Sec. ", ""),
    title: sourceDocument,
    locator: section,
    jurisdiction:
      "United States",
    effectiveFrom: null,
    effectiveTo: null,
    metadata: {
      sourceStatus: "draft",
      sourceDocument,
      section,
      purpose,
    },
  };
}

export const federalDataEncryptionAuthorities:
  readonly PolicyAuthorityReference[] = [
    authority(
      "Sec. 3",
      "Definitions and scope vocabulary",
    ),
    authority(
      "Sec. 4",
      "Encryption of covered information in transit and at rest, integrity/authentication, NIST standards, key management, and implementation",
    ),
    authority(
      "Sec. 5",
      "Contractor, subcontractor, cloud, shared-service, and external-system compliance",
    ),
    authority(
      "Sec. 6",
      "Oversight, annual certification, remediation reporting, and accountability",
    ),
    authority(
      "Sec. 7",
      "Temporary waivers, emergency communications exception, classified-system treatment, and no blanket waiver authority",
    ),
    authority(
      "Sec. 11",
      "Effective date and immediate commencement of compliance activity",
    ),
  ];

export const draftLegislationMetadata = {
  sourceStatus: "draft" as const,
  sourceDocument,
  activationPolicy:
    "Do not activate the registered ruleset until an enactment/effective timestamp is supplied.",
};
