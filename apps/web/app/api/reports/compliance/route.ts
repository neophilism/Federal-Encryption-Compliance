import {
  createOperatorEngineClient,
  readOperatorReadiness,
} from "../../../../lib/operator";
import {
  complianceExportFilename,
  parseComplianceExportFormat,
} from "../../../../lib/report-export";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: Request,
) {
  const url =
    new URL(request.url);
  let format:
    | "json"
    | "csv"
    | "text";

  try {
    format =
      parseComplianceExportFormat(
        url.searchParams.get(
          "format",
        ),
      );
  } catch (error) {
    return Response.json(
      {
        error:
          "invalid_format",
        message:
          error instanceof
            Error
            ? error.message
            : "Invalid report format",
      },
      {
        status: 400,
      },
    );
  }

  const readiness =
    readOperatorReadiness();

  if (
    !readiness.configured ||
    !readiness.organizationId
  ) {
    return Response.json(
      {
        error:
          "operator_not_configured",
        missing:
          readiness.missing,
      },
      {
        status: 503,
      },
    );
  }

  const resourceId =
    url.searchParams
      .get("resourceId")
      ?.trim() ||
    null;
  const asOf =
    url.searchParams
      .get("asOf")
      ?.trim() ||
    undefined;

  try {
    const client =
      createOperatorEngineClient();
    const filename =
      complianceExportFilename(
        format,
        resourceId,
      );

    if (
      format === "json"
    ) {
      const report =
        await client
          .getComplianceReport(
            resourceId ??
              undefined,
            asOf,
          );

      return Response.json(
        report,
        {
          headers: {
            "cache-control":
              "no-store",
            "content-disposition":
              'attachment; filename="' +
              filename +
              '"',
          },
        },
      );
    }

    const rendered =
      await client
        .getRenderedComplianceReport(
          format,
          resourceId ??
            undefined,
          asOf,
        );

    return new Response(
      rendered.body,
      {
        headers: {
          "cache-control":
            "no-store",
          "content-type":
            rendered.mediaType,
          "content-disposition":
            'attachment; filename="' +
            filename +
            '"',
        },
      },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          "report_unavailable",
        message:
          error instanceof
            Error
            ? error.message
            : "Compliance report could not be generated",
      },
      {
        status: 502,
      },
    );
  }
}
