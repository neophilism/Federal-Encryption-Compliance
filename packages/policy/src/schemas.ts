export type JsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  $id: string;
  title: string;
  type: "object";
  additionalProperties: boolean;
  required?: string[];
  properties: Record<string, unknown>;
};

const schema = (
  id: string,
  title: string,
  required: string[],
  properties: Record<string, unknown>,
): JsonSchema => ({
  $schema:
    "https://json-schema.org/draft/2020-12/schema",
  $id: id,
  title,
  type: "object",
  additionalProperties: false,
  required,
  properties,
});

export const federalAgencySchema = schema(
  "urn:fdea:resource:federal-agency:v1",
  "Federal Agency",
  ["agencyCode"],
  {
    agencyCode: {
      type: "string",
      minLength: 1,
    },
    componentName: {
      type: ["string", "null"],
    },
    cioOrCisoContactRef: {
      type: ["string", "null"],
    },
    highValueAssetCount: {
      type: "integer",
      minimum: 0,
    },
    annualCertificationDueDate: {
      type: ["string", "null"],
      format: "date",
    },
  },
);

export const informationSystemSchema = schema(
  "urn:fdea:resource:information-system:v1",
  "Information System",
  [
    "owningAgencyExternalRef",
    "handlesCoveredInformation",
    "informationCategories",
    "encryption",
  ],
  {
    owningAgencyExternalRef: {
      type: "string",
      minLength: 1,
    },
    handlesCoveredInformation: {
      type: "boolean",
    },
    informationCategories: {
      type: "array",
      uniqueItems: true,
      items: {
        enum: [
          "pii",
          "classified",
          "cui",
          "other-sensitive-government-information",
        ],
      },
    },
    highRisk: {
      type: "boolean",
    },
    highValueAsset: {
      type: "boolean",
    },
    usesPortableStorage: {
      type: "boolean",
    },
    publicFacingWebService: {
      type: "boolean",
    },
    agencyEmailSystem: {
      type: "boolean",
    },
    encryption: {
      type: "object",
      additionalProperties: false,
      required: [
        "inTransit",
        "atRest",
        "integrityAndAuthenticity",
        "nistConformant",
        "keyManagementCompliant",
      ],
      properties: {
        inTransit: {
          type: "object",
          additionalProperties: false,
          required: ["enabled"],
          properties: {
            enabled: {
              type: "boolean",
            },
            protocol: {
              type: ["string", "null"],
            },
            certificateValidation: {
              type: ["boolean", "null"],
            },
            downgradeProtection: {
              type: ["boolean", "null"],
            },
            hsts: {
              type: ["boolean", "null"],
            },
          },
        },
        atRest: {
          type: "object",
          additionalProperties: false,
          required: ["enabled"],
          properties: {
            enabled: {
              type: "boolean",
            },
            primaryStores: {
              type: ["boolean", "null"],
            },
            backupsAndArchives: {
              type: ["boolean", "null"],
            },
          },
        },
        portableStorage: {
          type: "object",
          additionalProperties: false,
          properties: {
            enabled: {
              type: ["boolean", "null"],
            },
          },
        },
        integrityAndAuthenticity: {
          type: "object",
          additionalProperties: false,
          required: ["enabled"],
          properties: {
            enabled: {
              type: "boolean",
            },
          },
        },
        nistConformant: {
          type: "boolean",
        },
        keyManagementCompliant: {
          type: "boolean",
        },
      },
    },
  },
);

export const coveredContractorSchema = schema(
  "urn:fdea:resource:covered-contractor:v1",
  "Covered Contractor",
  [
    "sponsoringAgencyExternalRef",
    "handlesCoveredInformation",
    "section4ControlsImplemented",
    "agreementRequiresSection4Compliance",
  ],
  {
    sponsoringAgencyExternalRef: {
      type: "string",
      minLength: 1,
    },
    handlesCoveredInformation: {
      type: "boolean",
    },
    section4ControlsImplemented: {
      type: "boolean",
    },
    agreementRequiresSection4Compliance: {
      type: "boolean",
    },
    usesSubcontractors: {
      type: "boolean",
    },
    subcontractorFlowdownImplemented: {
      type: ["boolean", "null"],
    },
    complianceAuditCurrent: {
      type: ["boolean", "null"],
    },
  },
);

export const externalServiceSchema = schema(
  "urn:fdea:resource:external-service:v1",
  "External Service",
  [
    "sponsoringAgencyExternalRef",
    "serviceKind",
    "handlesCoveredInformation",
    "section4ControlsImplemented",
    "agreementRequiresSection4Compliance",
    "keysPreventUnauthorizedProviderAccess",
  ],
  {
    sponsoringAgencyExternalRef: {
      type: "string",
      minLength: 1,
    },
    serviceKind: {
      enum: [
        "cloud",
        "shared-service",
        "external-information-system",
        "international-partner",
        "other",
      ],
    },
    handlesCoveredInformation: {
      type: "boolean",
    },
    section4ControlsImplemented: {
      type: "boolean",
    },
    agreementRequiresSection4Compliance: {
      type: "boolean",
    },
    keysPreventUnauthorizedProviderAccess: {
      type: "boolean",
    },
  },
);

function evidenceSchema(
  slug: string,
  title: string,
  required: string[],
  properties: Record<string, unknown>,
): JsonSchema {
  return schema(
    "urn:fdea:evidence:" + slug + ":v1",
    title,
    required,
    {
      observedAt: {
        type: "string",
        format: "date-time",
      },
      assessor: {
        type: ["string", "null"],
      },
      ...properties,
    },
  );
}

export const evidenceSchemas = {
  "fdea.transit-encryption-configuration":
    evidenceSchema(
      "transit-encryption-configuration",
      "Transit Encryption Configuration",
      [
        "observedAt",
        "protocol",
        "encrypted",
        "nistApproved",
      ],
      {
        protocol: {
          type: "string",
        },
        encrypted: {
          type: "boolean",
        },
        nistApproved: {
          type: "boolean",
        },
        certificateValidation: {
          type: ["boolean", "null"],
        },
        downgradeProtection: {
          type: ["boolean", "null"],
        },
        hsts: {
          type: ["boolean", "null"],
        },
      },
    ),
  "fdea.at-rest-encryption-configuration":
    evidenceSchema(
      "at-rest-encryption-configuration",
      "At-Rest Encryption Configuration",
      [
        "observedAt",
        "algorithm",
        "encrypted",
        "nistApproved",
      ],
      {
        algorithm: {
          type: "string",
        },
        encrypted: {
          type: "boolean",
        },
        nistApproved: {
          type: "boolean",
        },
        coversPrimaryStores: {
          type: "boolean",
        },
        coversBackupsArchivesAndExtracts: {
          type: "boolean",
        },
        coversPortableStorage: {
          type: ["boolean", "null"],
        },
      },
    ),
  "fdea.integrity-authentication-controls":
    evidenceSchema(
      "integrity-authentication-controls",
      "Integrity and Authentication Controls",
      ["observedAt", "cryptographicIntegrityEnabled"],
      {
        cryptographicIntegrityEnabled: {
          type: "boolean",
        },
        authenticatedEncryption: {
          type: ["boolean", "null"],
        },
        digitalSignaturesOrMacs: {
          type: ["boolean", "null"],
        },
        robustAccessControls: {
          type: ["boolean", "null"],
        },
        mfaWherePracticable: {
          type: ["boolean", "null"],
        },
      },
    ),
  "fdea.nist-cryptographic-conformance":
    evidenceSchema(
      "nist-cryptographic-conformance",
      "NIST Cryptographic Conformance",
      [
        "observedAt",
        "conformant",
        "applicableStandards",
      ],
      {
        conformant: {
          type: "boolean",
        },
        applicableStandards: {
          type: "array",
          items: {
            type: "string",
          },
          minItems: 1,
        },
        validatedModuleReferences: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    ),
  "fdea.key-management-controls":
    evidenceSchema(
      "key-management-controls",
      "Key Management Controls",
      [
        "observedAt",
        "rotationManaged",
        "keysStoredSeparately",
      ],
      {
        rotationManaged: {
          type: "boolean",
        },
        keysStoredSeparately: {
          type: "boolean",
        },
        providerUnauthorizedAccessPrevented: {
          type: ["boolean", "null"],
        },
      },
    ),
  "fdea.contractor-compliance-assessment":
    evidenceSchema(
      "contractor-compliance-assessment",
      "Contractor Encryption Compliance Assessment",
      [
        "observedAt",
        "section4ControlsVerified",
      ],
      {
        section4ControlsVerified: {
          type: "boolean",
        },
        assessmentReference: {
          type: ["string", "null"],
        },
      },
    ),
  "fdea.contract-compliance-clause":
    evidenceSchema(
      "contract-compliance-clause",
      "Contract Compliance Clause",
      [
        "observedAt",
        "agreementReference",
        "requiresSection4Compliance",
      ],
      {
        agreementReference: {
          type: "string",
        },
        requiresSection4Compliance: {
          type: "boolean",
        },
      },
    ),
  "fdea.subcontractor-flowdown":
    evidenceSchema(
      "subcontractor-flowdown",
      "Subcontractor Flow-Down Evidence",
      [
        "observedAt",
        "flowdownImplemented",
      ],
      {
        flowdownImplemented: {
          type: "boolean",
        },
        agreementReferences: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    ),
  "fdea.external-service-assessment":
    evidenceSchema(
      "external-service-assessment",
      "External Service Encryption Assessment",
      [
        "observedAt",
        "section4ControlsVerified",
      ],
      {
        section4ControlsVerified: {
          type: "boolean",
        },
        serviceReference: {
          type: ["string", "null"],
        },
      },
    ),
  "fdea.external-service-agreement":
    evidenceSchema(
      "external-service-agreement",
      "External Service Agreement",
      [
        "observedAt",
        "agreementReference",
        "requiresSection4Compliance",
      ],
      {
        agreementReference: {
          type: "string",
        },
        requiresSection4Compliance: {
          type: "boolean",
        },
      },
    ),
} as const;

export const resourceSchemas = {
  "federal-agency":
    federalAgencySchema,
  "information-system":
    informationSystemSchema,
  "covered-contractor":
    coveredContractorSchema,
  "external-service":
    externalServiceSchema,
} as const;
