import {
  toPublicThinAppConfig,
} from "@caiae/sdk";
import {
  buildThinAppConfig,
} from "../../../lib/config";

export async function GET() {
  return Response.json(
    toPublicThinAppConfig(
      buildThinAppConfig(),
    ),
  );
}
