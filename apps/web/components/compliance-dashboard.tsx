import Link from "next/link";
import type {
  FederalDashboardData,
} from "../lib/dashboard";
import type {
  FederalLegalStatus,
} from "../lib/legal-status";

type Props = {
  data: FederalDashboardData;
  legalStatus:
    FederalLegalStatus;
  resourceId?: string;
};

export function ComplianceDashboard({
  data,
  legalStatus,
  resourceId,
}: Props) {
  const resource =
    resourceId
      ? data.resources[0] ??
        null
      : null;

  return (
    <>
      <section className="command-bar">
        <div>
          <p className="eyebrow">
            Federal Data Encryption Act
          </p>
          <h1>
            {resource
              ? resource.name
              : "Compliance operations"}
          </h1>
          <p className="lede">
            {resource
              ? "Resource-level compliance, deadlines, findings, remediation, and certification."
              : "Agency-wide encryption compliance, statutory oversight, remediation, certification, and audit integrity."}
          </p>
        </div>
        <div
          className={
            "legal-mode " +
            legalStatus.mode
          }
        >
          <span>
            Legal mode
          </span>
          <strong>
            {legalStatus.label}
          </strong>
          <p>
            {legalStatus.detail}
          </p>
        </div>
      </section>

      <section
        className="metric-grid"
        aria-label="Compliance summary"
      >
        {data.metrics.map(
          (metric) => (
            <article
              className={
                "metric " +
                metric.tone
              }
              key={
                metric.label
              }
            >
              <span>
                {metric.label}
              </span>
              <strong>
                {metric.value}
              </strong>
            </article>
          ),
        )}
      </section>

      <section className="report-actions">
        <div>
          <span>
            Organization
          </span>
          <strong>
            {data.organization.name ||
              data.organization.id}
          </strong>
        </div>
        <div>
          <span>As of</span>
          <strong>
            {formatDateTime(
              data.asOf,
            )}
          </strong>
        </div>
        <nav
          aria-label="Report exports"
        >
          <ExportLink
            format="json"
            resourceId={
              resourceId
            }
          />
          <ExportLink
            format="csv"
            resourceId={
              resourceId
            }
          />
          <ExportLink
            format="text"
            resourceId={
              resourceId
            }
          />
        </nav>
      </section>

      <div className="dashboard-columns">
        <section className="panel">
          <PanelHeading
            title="Deadline watch"
            detail="Active statutory and operational clocks"
          />
          {data.deadlines.length ===
          0 ? (
            <EmptyState>
              No active deadlines.
            </EmptyState>
          ) : (
            <div className="stack">
              {data.deadlines
                .slice(0, 8)
                .map(
                  (deadline) => (
                    <article
                      className="stack-row"
                      key={
                        deadline.id
                      }
                    >
                      <div>
                        <StatusPill
                          value={
                            deadline.effectiveStatus
                          }
                        />
                        <strong>
                          {humanize(
                            deadline.deadlineType,
                          )}
                        </strong>
                        <small>
                          {deadline.subjectType ??
                            "deadline"}
                        </small>
                      </div>
                      <time>
                        {formatDate(
                          deadline.dueAt,
                        )}
                      </time>
                    </article>
                  ),
                )}
            </div>
          )}
        </section>

        <section className="panel">
          <PanelHeading
            title="Open findings"
            detail="Unresolved control failures requiring attention"
          />
          {data.findings.length ===
          0 ? (
            <EmptyState>
              No unresolved findings.
            </EmptyState>
          ) : (
            <div className="stack">
              {data.findings
                .slice(0, 8)
                .map(
                  (finding) => (
                    <article
                      className="finding-row"
                      key={
                        finding.id
                      }
                    >
                      <div className="finding-meta">
                        <StatusPill
                          value={
                            finding.severity
                          }
                        />
                        <span>
                          {finding.status}
                        </span>
                      </div>
                      <strong>
                        {finding.title ||
                          "Compliance finding"}
                      </strong>
                      <p>
                        {finding.description}
                      </p>
                      {!resourceId && (
                        <Link
                          href={
                            "/resources/" +
                            encodeURIComponent(
                              finding.resourceId,
                            )
                          }
                        >
                          Open resource
                        </Link>
                      )}
                    </article>
                  ),
                )}
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <PanelHeading
          title="Resource inventory"
          detail={
            resourceId
              ? "Selected resource"
              : "Current compliance posture by resource"
          }
        />
        {data.resources.length ===
        0 ? (
          <EmptyState>
            No resources are in the report scope.
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Resource
                  </th>
                  <th>
                    Type
                  </th>
                  <th>
                    Latest check
                  </th>
                  <th>
                    Open findings
                  </th>
                  <th>
                    Overdue
                  </th>
                  <th>
                    Valid certs
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.resources.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td>
                        {resourceId ? (
                          <strong>
                            {item.name}
                          </strong>
                        ) : (
                          <Link
                            href={
                              "/resources/" +
                              encodeURIComponent(
                                item.id,
                              )
                            }
                          >
                            {item.name ||
                              item.id}
                          </Link>
                        )}
                      </td>
                      <td>
                        {humanize(
                          item.resourceType,
                        )}
                      </td>
                      <td>
                        <StatusPill
                          value={
                            item.latestCheckStatus ??
                            "not checked"
                          }
                        />
                      </td>
                      <td>
                        {item.unresolvedFindings}
                      </td>
                      <td>
                        {item.overdueDeadlines}
                      </td>
                      <td>
                        {item.validCertifications}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="dashboard-columns">
        <section className="panel">
          <PanelHeading
            title="Remediation"
            detail="Active remediation plans and verification work"
          />
          {data.remediations.length ===
          0 ? (
            <EmptyState>
              No active remediation plans.
            </EmptyState>
          ) : (
            <div className="stack">
              {data.remediations
                .slice(0, 10)
                .map(
                  (item) => (
                    <article
                      className="stack-row wide"
                      key={
                        item.id
                      }
                    >
                      <div>
                        <StatusPill
                          value={
                            item.status
                          }
                        />
                        <strong>
                          {item.plan}
                        </strong>
                      </div>
                      <time>
                        {item.dueAt
                          ? "Due " +
                            formatDate(
                              item.dueAt,
                            )
                          : "No separate due date"}
                      </time>
                    </article>
                  ),
                )}
            </div>
          )}
        </section>

        <section className="panel">
          <PanelHeading
            title="Certifications"
            detail="Operational positive certifications; statutory filings are shown separately"
          />
          {data.certifications.length ===
          0 ? (
            <EmptyState>
              No certifications in scope.
            </EmptyState>
          ) : (
            <div className="stack">
              {data.certifications
                .slice(0, 10)
                .map(
                  (item) => (
                    <article
                      className="stack-row wide"
                      key={
                        item.id
                      }
                    >
                      <div>
                        <StatusPill
                          value={
                            item.effectiveStatus
                          }
                        />
                        <strong>
                          {humanize(
                            item.certificationType,
                          )}
                        </strong>
                        <small>
                          {item.certificateNumber ??
                            "Certificate number pending"}
                        </small>
                      </div>
                      <time>
                        {item.validUntil
                          ? "Through " +
                            formatDate(
                              item.validUntil,
                            )
                          : ""}
                      </time>
                    </article>
                  ),
                )}
            </div>
          )}
        </section>
      </div>

      {!resourceId && (
        <section className="panel">
          <PanelHeading
            title="Section 6 filings"
            detail="Annual certification filings and quarterly progress updates are statutory submissions, not automatic positive compliance certificates"
          />
          {data.filings.length ===
          0 ? (
            <EmptyState>
              No Section 6 filings have been persisted.
            </EmptyState>
          ) : (
            <div className="filing-grid">
              {data.filings
                .slice(0, 12)
                .map(
                  (filing) => (
                    <article
                      className="filing"
                      key={
                        filing.id
                      }
                    >
                      <span>
                        {filing.resourceType ===
                        "fdea-annual-certification-filing"
                          ? "Annual filing"
                          : "Quarterly update"}
                      </span>
                      <strong>
                        {filing.reportingYear
                          ? String(
                              filing.reportingYear,
                            )
                          : filing.sequence
                            ? "Update " +
                              filing.sequence
                            : filing.name}
                      </strong>
                      <StatusPill
                        value={
                          filing.fullCompliance ===
                          true
                            ? "full compliance"
                            : filing.fullCompliance ===
                                false
                              ? "remediation continuing"
                              : "status unavailable"
                        }
                      />
                      <time>
                        {formatDateTime(
                          filing.submittedAt,
                        )}
                      </time>
                    </article>
                  ),
                )}
            </div>
          )}
        </section>
      )}

      <section
        className={
          "audit-strip " +
          (data.audit
            .allChainsValid
            ? "valid"
            : "invalid")
        }
      >
        <div>
          <span>
            Immutable audit integrity
          </span>
          <strong>
            {data.audit
              .allChainsValid
              ? "All reported chains valid"
              : data.audit
                    .invalidChainCount +
                " invalid chain(s)"}
          </strong>
        </div>
        <span>
          {data.audit.chainCount} chain
          {data.audit.chainCount ===
          1
            ? ""
            : "s"}{" "}
          checked
        </span>
      </section>
    </>
  );
}

function PanelHeading({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <header className="panel-heading">
      <div>
        <p className="eyebrow">
          Operations
        </p>
        <h2>{title}</h2>
      </div>
      <p>{detail}</p>
    </header>
  );
}

function StatusPill({
  value,
}: {
  value: string;
}) {
  const normalized =
    value
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      );

  return (
    <span
      className={
        "status-pill status-" +
        normalized
      }
    >
      {humanize(value)}
    </span>
  );
}

function EmptyState({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p className="empty-state">
      {children}
    </p>
  );
}

function ExportLink({
  format,
  resourceId,
}: {
  format:
    | "json"
    | "csv"
    | "text";
  resourceId?: string;
}) {
  const params =
    new URLSearchParams({
      format,
    });

  if (resourceId) {
    params.set(
      "resourceId",
      resourceId,
    );
  }

  return (
    <a
      href={
        "/api/reports/compliance?" +
        params.toString()
      }
    >
      {format.toUpperCase()}
    </a>
  );
}

function humanize(
  value: string,
): string {
  const cleaned =
    value
      .replace(
        /^fdea\./,
        "",
      )
      .replace(
        /[_-]+/g,
        " ",
      )
      .trim();

  if (!cleaned) {
    return "Unknown";
  }

  return cleaned
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "No due date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName:
        "short",
      timeZone: "UTC",
    },
  ).format(date);
}
