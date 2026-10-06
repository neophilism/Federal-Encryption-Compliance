import type {
  FederalEvidenceFixture,
  FederalResourceFixture,
} from "./types.js";

const observedAt =
  "2026-10-06T16:00:00.000Z";

function systemEvidence(
  compliant: boolean,
): FederalEvidenceFixture[] {
  return [
    {
      evidenceType:
        "fdea.transit-encryption-configuration",
      title:
        "Transit encryption configuration snapshot",
      attributes: {
        observedAt,
        protocol:
          compliant
            ? "TLS 1.3"
            : "legacy-or-none",
        encrypted:
          compliant,
        nistApproved:
          compliant,
        certificateValidation:
          compliant,
        downgradeProtection:
          compliant,
        hsts:
          compliant,
        emailTransportProtected:
          compliant,
      },
    },
    {
      evidenceType:
        "fdea.at-rest-encryption-configuration",
      title:
        "At-rest encryption configuration snapshot",
      attributes: {
        observedAt,
        algorithm:
          compliant
            ? "NIST-approved algorithm"
            : "unapproved-or-none",
        encrypted:
          compliant,
        nistApproved:
          compliant,
        coversPrimaryStores:
          compliant,
        coversBackupsArchivesAndExtracts:
          compliant,
        coversPortableStorage:
          compliant,
      },
    },
    {
      evidenceType:
        "fdea.integrity-authentication-controls",
      title:
        "Integrity and authentication controls",
      attributes: {
        observedAt,
        cryptographicIntegrityEnabled:
          compliant,
        authenticatedEncryption:
          compliant,
        digitalSignaturesOrMacs:
          compliant,
        robustAccessControls:
          compliant,
        mfaWherePracticable:
          compliant,
      },
    },
    {
      evidenceType:
        "fdea.nist-cryptographic-conformance",
      title:
        "NIST cryptographic conformance assessment",
      attributes: {
        observedAt,
        conformant:
          compliant,
        applicableStandards: [
          "Applicable NIST cryptographic standards",
        ],
        validatedModuleReferences:
          [],
      },
    },
    {
      evidenceType:
        "fdea.key-management-controls",
      title:
        "Key management control assessment",
      attributes: {
        observedAt,
        rotationManaged:
          compliant,
        keysStoredSeparately:
          compliant,
      },
    },
  ];
}

function systemAttributes(
  compliant: boolean,
) {
  return {
    owningAgencyExternalRef:
      "agency-example",
    handlesCoveredInformation:
      true,
    informationCategories: [
      "pii",
      "cui",
    ],
    highRisk: true,
    highValueAsset: true,
    usesPortableStorage: true,
    publicFacingWebService: true,
    agencyEmailSystem: true,
    encryption: {
      inTransit: {
        enabled: compliant,
        protocol:
          compliant
            ? "TLS 1.3"
            : "legacy-or-none",
        certificateValidation:
          compliant,
        downgradeProtection:
          compliant,
        hsts: compliant,
        emailTransportProtected:
          compliant,
      },
      atRest: {
        enabled: compliant,
        primaryStores:
          compliant,
        backupsAndArchives:
          compliant,
      },
      portableStorage: {
        enabled: compliant,
      },
      integrityAndAuthenticity: {
        enabled: compliant,
      },
      nistConformant:
        compliant,
      keyManagementCompliant:
        compliant,
    },
  };
}

export const fullyCompliantSystem:
  FederalResourceFixture = {
    id: "fully-compliant-system",
    description:
      "Covered information system satisfying all currently modeled Section 4 controls with complete evidence.",
    expectedStatus: "pass",
    resource: {
      resourceType:
        "information-system",
      name:
        "Fixture — Fully Compliant System",
      externalRef:
        "fixture:system:pass",
      attributes:
        systemAttributes(true),
    },
    evidence:
      systemEvidence(true),
  };

export const failingSystem:
  FederalResourceFixture = {
    id: "failing-system",
    description:
      "Covered information system with evidence present but modeled encryption controls disabled.",
    expectedStatus: "fail",
    resource: {
      resourceType:
        "information-system",
      name:
        "Fixture — Failing System",
      externalRef:
        "fixture:system:fail",
      attributes:
        systemAttributes(false),
    },
    evidence:
      systemEvidence(false),
  };

export const incompleteEvidenceSystem:
  FederalResourceFixture = {
    id:
      "incomplete-evidence-system",
    description:
      "Attributes satisfy modeled controls but no evidence records are supplied, producing unknown results.",
    expectedStatus:
      "unknown",
    resource: {
      resourceType:
        "information-system",
      name:
        "Fixture — Incomplete Evidence System",
      externalRef:
        "fixture:system:unknown",
      attributes:
        systemAttributes(true),
    },
    evidence: [],
  };

export const nonCoveredSystem:
  FederalResourceFixture = {
    id: "non-covered-system",
    description:
      "Information system declared not to handle covered information, so currently modeled controls are not applicable.",
    expectedStatus: "pass",
    resource: {
      resourceType:
        "information-system",
      name:
        "Fixture — Non-Covered System",
      externalRef:
        "fixture:system:not-covered",
      attributes: {
        ...systemAttributes(false),
        handlesCoveredInformation:
          false,
      },
    },
    evidence: [],
  };

export const evaluationFixtures =
  [
    fullyCompliantSystem,
    failingSystem,
    incompleteEvidenceSystem,
    nonCoveredSystem,
  ] as const;

export function getEvaluationFixture(
  id: string,
): FederalResourceFixture {
  const fixture =
    evaluationFixtures.find(
      (candidate) =>
        candidate.id === id,
    );

  if (!fixture) {
    throw new Error(
      "unknown evaluation fixture: " +
        id,
    );
  }

  return fixture;
}
