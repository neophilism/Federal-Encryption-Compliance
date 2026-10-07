import {
  SdkError,
} from "@caiae/sdk";
import {
  createPublicEngineClient,
} from "../../../lib/engine";
import {
  isFederalDemoMode,
} from "../../../lib/demo-mode";

export const dynamic =
  "force-dynamic";

export async function GET() {
  if (isFederalDemoMode()) {
    return Response.json({
      engine: {
        status: "ok",
        release:
          "federal-fictional-demo",
        mode: "demo",
      },
      demo: true,
      fictional: true,
    });
  }

  const client =
    createPublicEngineClient();

  try {
    const engine =
      await client.getHealth();

    return Response.json({
      engine,
      demo: false,
    });
  } catch (error) {
    const message =
      error instanceof SdkError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Engine health check failed";

    return Response.json(
      {
        error:
          "engine_unavailable",
        message,
      },
      {
        status: 503,
      },
    );
  }
}
