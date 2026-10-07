import type {
  Finding,
  JsonObject,
} from "@caiae/sdk";
import type {
  evidenceSchemas,
  resourceSchemas,
} from "@federal-encryption/policy";

export type FederalResourceType =
  keyof typeof resourceSchemas;

export type FederalEvidenceType =
  keyof typeof evidenceSchemas;

export type FederalResourceFixture = {
  id: string;
  description: string;
  expectedStatus:
    | "pass"
    | "fail"
    | "unknown";
  resource: {
    resourceType:
      FederalResourceType;
    name: string;
    externalRef: string;
    attributes: JsonObject;
  };
  evidence:
    FederalEvidenceFixture[];
};

export type FederalEvidenceFixture = {
  evidenceType:
    FederalEvidenceType;
  title: string;
  attributes: JsonObject;
};

export type EvaluationMode =
  | {
      mode: "simulation";
    }
  | {
      mode: "registered";
      registeredRuleSetId: string;
    };

export type EvaluateResourceOptions = {
  resourceId: string;
  evaluationMode:
    EvaluationMode;
  requestedByPrincipalId?:
    string | null;
  evaluatedAt?: string;
  correlationId?:
    string | null;
  syncFindings?: boolean;
};

export type EvaluationRuleResult = {
  ruleId: string;
  status:
    | "pass"
    | "fail"
    | "unknown"
    | "not_applicable";
  severity: string;
  missingEvidenceTypes:
    string[];
};

export type ParsedEvaluation = {
  ruleSetId: string;
  version: string;
  status:
    | "pass"
    | "fail"
    | "unknown";
  counts: {
    pass: number;
    fail: number;
    unknown: number;
    notApplicable: number;
  };
  rules:
    EvaluationRuleResult[];
};

export type FederalEvaluationResult = {
  checkId: string;
  checkStatus: string;
  registrationMode:
    string | null;
  evaluation:
    ParsedEvaluation;
  findings: Finding[];
};
