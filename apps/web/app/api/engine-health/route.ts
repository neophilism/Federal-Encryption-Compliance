import {
  SdkError,
} from "@caiae/sdk";
import {
  createPublicEngineClient,
} from "../../../lib/engine";

export const dynamic =
  "force-dynamic";

export async function GET() {
  const client =
    createPublicEngineClient();

  try {
    const response =
      await client.request<{
        status: string;
        service: string;
        release?: string | null;
        timestamp: string;
      }>("/health");

    return Response.json({
      engine: response.data,
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
