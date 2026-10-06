import type {
  DeclarativeRuleSet,
} from "@caiae/sdk";

type RuleExpression =
  NonNullable<
    DeclarativeRuleSet["rules"][number]["appliesWhen"]
  >;

const systemScopeExpressions:
  RuleExpression[] = [
    {
      field: "resource.resourceType",
      operator: "equals",
      value: "information-system",
    },
    {
      field:
        "resource.attributes.handlesCoveredInformation",
      operator: "equals",
      value: true,
    },
  ];

const systemScope:
  RuleExpression = {
    all:
      systemScopeExpressions,
  };

const contractorScopeExpressions:
  RuleExpression[] = [
    {
      field: "resource.resourceType",
      operator: "equals",
      value: "covered-contractor",
    },
    {
      field:
        "resource.attributes.handlesCoveredInformation",
      operator: "equals",
      value: true,
    },
  ];

const contractorScope:
  RuleExpression = {
    all:
      contractorScopeExpressions,
  };

const externalServiceScopeExpressions:
  RuleExpression[] = [
    {
      field: "resource.resourceType",
      operator: "equals",
      value: "external-service",
    },
    {
      field:
        "resource.attributes.handlesCoveredInformation",
      operator: "equals",
      value: true,
    },
  ];

const externalServiceScope:
  RuleExpression = {
    all:
      externalServiceScopeExpressions,
  };

export const federalDataEncryptionRuleSet:
  DeclarativeRuleSet = {
    schemaVersion: "1",
    id: "federal-data-encryption-act",
    version: "2025-draft-1",
    title:
      "Federal Data Encryption Act Compliance",
    description:
      "Declarative compliance controls for the draft Federal Data Encryption Act of 2025. Registration is draft-only until an enactment/effective timestamp is supplied.",
    metadata: {
      sourceStatus: "draft",
      policyFamily:
        "federal-data-encryption-act",
      downstreamApp:
        "federal-encryption-compliance",
    },
    rules: [
      {
        id: "fdea.s4.transit-encryption",
        title:
          "Covered information is encrypted in transit",
        description:
          "Information systems handling covered information must enforce strong encrypted transport for covered data flows.",
        severity: "critical",
        appliesWhen: systemScope,
        require: {
          field:
            "resource.attributes.encryption.inTransit.enabled",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.transit-encryption-configuration",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(a)(1)",
          authorityLocator:
            "Sec. 4(a)(1)",
        },
      },
      {
        id:
          "fdea.s4.public-web-hsts",
        title:
          "Public-facing web services enforce HTTPS-only access with HSTS",
        severity: "high",
        appliesWhen: {
          all: [
            ...systemScopeExpressions,
            {
              field:
                "resource.attributes.publicFacingWebService",
              operator: "equals",
              value: true,
            },
          ],
        },
        require: {
          field:
            "resource.attributes.encryption.inTransit.hsts",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.transit-encryption-configuration",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(a)(1)",
          authorityLocator:
            "Sec. 4(a)(1)",
        },
      },
      {
        id:
          "fdea.s4.email-transport-protection",
        title:
          "Agency email transport prevents downgrade and interception",
        severity: "high",
        appliesWhen: {
          all: [
            ...systemScopeExpressions,
            {
              field:
                "resource.attributes.agencyEmailSystem",
              operator: "equals",
              value: true,
            },
          ],
        },
        require: {
          field:
            "resource.attributes.encryption.inTransit.emailTransportProtected",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.transit-encryption-configuration",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(a)(1)",
          authorityLocator:
            "Sec. 4(a)(1)",
        },
      },
      {
        id: "fdea.s4.at-rest-encryption",
        title:
          "Covered information is encrypted at rest",
        description:
          "Primary and secondary storage holding covered information must use strong encryption at rest.",
        severity: "critical",
        appliesWhen: systemScope,
        require: {
          field:
            "resource.attributes.encryption.atRest.enabled",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.at-rest-encryption-configuration",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(a)(2)",
          authorityLocator:
            "Sec. 4(a)(2)",
        },
      },
      {
        id:
          "fdea.s4.portable-storage-encryption",
        title:
          "Portable storage containing covered information is encrypted",
        severity: "high",
        appliesWhen: {
          all: [
            ...systemScopeExpressions,
            {
              field:
                "resource.attributes.usesPortableStorage",
              operator: "equals",
              value: true,
            },
          ],
        },
        require: {
          field:
            "resource.attributes.encryption.portableStorage.enabled",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.at-rest-encryption-configuration",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(a)(2)",
          authorityLocator:
            "Sec. 4(a)(2)",
        },
      },
      {
        id:
          "fdea.s4.integrity-authentication",
        title:
          "Cryptographic integrity and authenticity controls are implemented",
        severity: "high",
        appliesWhen: systemScope,
        require: {
          field:
            "resource.attributes.encryption.integrityAndAuthenticity.enabled",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.integrity-authentication-controls",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(a)(3)",
          authorityLocator:
            "Sec. 4(a)(3)",
        },
      },
      {
        id:
          "fdea.s4.nist-conformance",
        title:
          "Cryptographic implementation conforms to applicable NIST standards",
        severity: "critical",
        appliesWhen: systemScope,
        require: {
          field:
            "resource.attributes.encryption.nistConformant",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.nist-cryptographic-conformance",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(b)",
          authorityLocator:
            "Sec. 4(b)",
        },
      },
      {
        id:
          "fdea.s4.key-management",
        title:
          "Cryptographic keys are managed under applicable NIST guidance",
        severity: "critical",
        appliesWhen: systemScope,
        require: {
          field:
            "resource.attributes.encryption.keyManagementCompliant",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.key-management-controls",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 4(b)",
          authorityLocator:
            "Sec. 4(b)",
        },
      },
      {
        id:
          "fdea.s5.contractor-section4-compliance",
        title:
          "Covered contractor implements Section 4 encryption controls",
        severity: "critical",
        appliesWhen: contractorScope,
        require: {
          field:
            "resource.attributes.section4ControlsImplemented",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.contractor-compliance-assessment",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 5(a)",
          authorityLocator:
            "Sec. 5(a)",
        },
      },
      {
        id:
          "fdea.s5.contract-compliance-clause",
        title:
          "Covered-information agreement requires statutory encryption compliance",
        severity: "high",
        appliesWhen: contractorScope,
        require: {
          field:
            "resource.attributes.agreementRequiresSection4Compliance",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.contract-compliance-clause",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 5(a)",
          authorityLocator:
            "Sec. 5(a)",
        },
      },
      {
        id:
          "fdea.s5.subcontractor-flowdown",
        title:
          "Encryption requirements flow down to covered subcontractors",
        severity: "high",
        appliesWhen: {
          all: [
            ...contractorScopeExpressions,
            {
              field:
                "resource.attributes.usesSubcontractors",
              operator: "equals",
              value: true,
            },
          ],
        },
        require: {
          field:
            "resource.attributes.subcontractorFlowdownImplemented",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.subcontractor-flowdown",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 5(b)",
          authorityLocator:
            "Sec. 5(b)",
        },
      },
      {
        id:
          "fdea.s5.external-service-encryption",
        title:
          "External service protects covered information with required encryption",
        severity: "critical",
        appliesWhen:
          externalServiceScope,
        require: {
          field:
            "resource.attributes.section4ControlsImplemented",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.external-service-assessment",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 5(c)",
          authorityLocator:
            "Sec. 5(c)",
        },
      },
      {
        id:
          "fdea.s5.external-service-agreement",
        title:
          "External-service agreement requires compliance",
        severity: "high",
        appliesWhen:
          externalServiceScope,
        require: {
          field:
            "resource.attributes.agreementRequiresSection4Compliance",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.external-service-agreement",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 5(c)",
          authorityLocator:
            "Sec. 5(c)",
        },
      },
      {
        id:
          "fdea.s5.external-service-key-isolation",
        title:
          "External-service key management prevents unauthorized provider access",
        severity: "critical",
        appliesWhen:
          externalServiceScope,
        require: {
          field:
            "resource.attributes.keysPreventUnauthorizedProviderAccess",
          operator: "equals",
          value: true,
        },
        requiredEvidenceTypes: [
          "fdea.key-management-controls",
        ],
        metadata: {
          authorityCitation:
            "Federal Data Encryption Act of 2025 § 5(c)",
          authorityLocator:
            "Sec. 5(c)",
        },
      },
    ],
  };
