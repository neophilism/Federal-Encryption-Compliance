import {
  provisionFederalDataEncryptionPolicy,
} from "./provisioning.js";

function required(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      name + " is required",
    );
  }

  return value;
}

const result =
  await provisionFederalDataEncryptionPolicy({
    baseUrl:
      required(
        "CAIAE_API_BASE_URL",
      ),
    organizationId:
      required(
        "CAIAE_ORGANIZATION_ID",
      ),
    operatorToken:
      required(
        "CAIAE_OPERATOR_TOKEN",
      ),
    existingPolicyId:
      process.env
        .FDEA_POLICY_ID
        ?.trim() ||
      undefined,
    effectiveFrom:
      process.env
        .FDEA_EFFECTIVE_FROM
        ?.trim() ||
      undefined,
  });

process.stdout.write(
  JSON.stringify(
    result,
    null,
    2,
  ) + "\n",
);
