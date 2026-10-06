import {
  createOperatorClient,
  type ComplianceEngineClient,
} from "@caiae/sdk";
import {
  draftLegislationMetadata,
  federalDataEncryptionAuthorities,
} from "./authorities.js";
import {
  federalDataEncryptionRuleSet,
} from "./ruleset.js";

export const FEDERAL_DATA_ENCRYPTION_POLICY_KEY =
  "federal-data-encryption-act";

export type ProvisionPolicyOptions = {
  baseUrl: string;
  organizationId: string;
  operatorToken: string;
  existingPolicyId?: string;
  effectiveFrom?: string;
  fetchImpl?: typeof fetch;
};

export type ProvisionedPolicyBundle = {
  policyId: string;
  registeredRuleSetId: string;
  ruleSetStatus: string;
  effectiveFrom: string | null;
};

export function buildRuleSetRegistrationBody(
  organizationId: string,
  policyId: string,
) {
  return {
    organizationId,
    policyId,
    key:
      FEDERAL_DATA_ENCRYPTION_POLICY_KEY,
    ruleSet:
      federalDataEncryptionRuleSet,
    authorities:
      federalDataEncryptionAuthorities,
    metadata: {
      ...draftLegislationMetadata,
      downstreamRepository:
        "neophilism/Federal-Encryption-Compliance",
    },
  };
}

export async function provisionFederalDataEncryptionPolicy(
  options: ProvisionPolicyOptions,
): Promise<ProvisionedPolicyBundle> {
  const client =
    createOperatorClient({
      baseUrl: options.baseUrl,
      organizationId:
        options.organizationId,
      token:
        options.operatorToken,
      transport: {
        fetchImpl:
          options.fetchImpl,
      },
    });

  const policyId =
    options.existingPolicyId ??
    await createPolicy(
      client,
      options.organizationId,
    );

  const registered =
    await client.request<{
      id: string;
      status: string;
      effectiveFrom:
        string | null;
    }>(
      "/v1/rulesets",
      {
        method: "POST",
        body:
          buildRuleSetRegistrationBody(
            options.organizationId,
            policyId,
          ),
      },
    );

  let finalStatus =
    registered.data.status;
  let effectiveFrom =
    registered.data.effectiveFrom;

  if (options.effectiveFrom) {
    const activated =
      await client.request<{
        status: string;
        effectiveFrom:
          string | null;
      }>(
        "/v1/rulesets/" +
          encodeURIComponent(
            registered.data.id,
          ) +
          "/activate",
        {
          method: "POST",
          body: {
            effectiveFrom:
              options.effectiveFrom,
          },
        },
      );

    finalStatus =
      activated.data.status;
    effectiveFrom =
      activated.data.effectiveFrom;
  }

  return {
    policyId,
    registeredRuleSetId:
      registered.data.id,
    ruleSetStatus:
      finalStatus,
    effectiveFrom,
  };
}

async function createPolicy(
  client: ComplianceEngineClient,
  organizationId: string,
): Promise<string> {
  const response =
    await client.request<{
      id: string;
    }>(
      "/v1/policies",
      {
        method: "POST",
        body: {
          organizationId,
          key:
            FEDERAL_DATA_ENCRYPTION_POLICY_KEY,
          title:
            "Federal Data Encryption Act Compliance",
          description:
            "Draft downstream policy bundle for the Federal Data Encryption Act of 2025.",
          status: "draft",
        },
      },
    );

  return response.data.id;
}
