import assert from "node:assert/strict";
import test from "node:test";
import {
  FederalOversightManager,
} from "../src/index.js";

const ORG =
  "11111111-1111-4111-8111-111111111111";
const AGENCY =
  "22222222-2222-4222-8222-222222222222";
const CONTRACTOR =
  "33333333-3333-4333-8333-333333333333";

test("persisted oversight refuses to exist without confirmed enactment authority", () => {
  assert.throws(
    () =>
      new FederalOversightManager({
        baseUrl:
          "https://engine.example.gov",
        organizationId:
          ORG,
        operatorToken:
          "caiau_test_operator",
        enactmentAt:
          "2026-01-01T00:00:00.000Z",
        enactmentReference:
          "",
        fetchImpl:
          fakeEngine().fetchImpl,
      }),
    /enactmentReference is required/,
  );

  assert.throws(
    () =>
      new FederalOversightManager({
        baseUrl:
          "https://engine.example.gov",
        organizationId:
          ORG,
        operatorToken:
          "caiau_test_operator",
        enactmentAt:
          "hypothetical",
        enactmentReference:
          "Public Law reference",
        fetchImpl:
          fakeEngine().fetchImpl,
      }),
    /valid date-time/,
  );
});

test("enactment provisioning creates the four statutory clock classes and is idempotent", async () => {
  const engine =
    fakeEngine();
  const manager =
    managerWith(engine);

  const first =
    await manager
      .provisionEnactmentClocks({
        createdByPrincipalId:
          "compliance-officer",
        agencyResourceIds: [
          AGENCY,
        ],
        existingContractorResourceIds: [
          CONTRACTOR,
        ],
        correlationId:
          "enactment-provision",
      });

  assert.equal(
    first.agencyImplementation
      .length,
    1,
  );
  assert.equal(
    first.existingContractTransitions
      .length,
    1,
  );

  const creates =
    engine.calls.filter(
      (call) =>
        call.method ===
          "POST" &&
        call.pathname ===
          "/v1/deadlines",
    );
  assert.equal(
    creates.length,
    4,
  );

  const byType =
    new Map(
      creates.map(
        (call) => [
          call.body
            .deadlineType,
          call.body,
        ],
      ),
    );

  assert.equal(
    byType.get(
      "fdea.s4.nist-guidance",
    ).dueAt,
    "2026-06-30T00:00:00.000Z",
  );
  assert.equal(
    byType.get(
      "fdea.s4.agency-implementation",
    ).dueAt,
    "2027-01-01T00:00:00.000Z",
  );
  assert.equal(
    byType.get(
      "fdea.s5.existing-contract-transition",
    ).dueAt,
    "2027-01-01T00:00:00.000Z",
  );
  assert.equal(
    byType.get(
      "fdea.s6.gao-evaluation",
    ).dueAt,
    "2027-07-01T00:00:00.000Z",
  );

  for (
    const call of creates
  ) {
    assert.equal(
      call.body
        .gracePeriodSeconds,
      0,
    );
    assert.equal(
      call.body.metadata
        .federalEncryption
        .sourceStatus,
      "enacted",
    );
    assert.equal(
      call.body.metadata
        .federalEncryption
        .enactmentReference,
      "Public Law test reference",
    );
  }

  await manager
    .provisionEnactmentClocks({
      createdByPrincipalId:
        "compliance-officer",
      agencyResourceIds: [
        AGENCY,
      ],
      existingContractorResourceIds: [
        CONTRACTOR,
      ],
    });

  const afterRepeat =
    engine.calls.filter(
      (call) =>
        call.method ===
          "POST" &&
        call.pathname ===
          "/v1/deadlines",
    );
  assert.equal(
    afterRepeat.length,
    4,
    "re-provisioning must reuse existing active clocks",
  );
});

test("annual certification uses the explicit OMB date and never invents a fixed annual recurrence", async () => {
  const engine =
    fakeEngine();
  const manager =
    managerWith(engine);

  await manager
    .scheduleAnnualCertification({
      agencyResourceId:
        AGENCY,
      reportingYear:
        2027,
      ombDueAt:
        "2027-12-15T17:00:00.000Z",
      ombDirectiveReference:
        "OMB-M-27-TEST",
      createdByPrincipalId:
        "compliance-officer",
    });

  const create =
    lastCreate(engine);
  assert.equal(
    create.body.dueAt,
    "2027-12-15T17:00:00.000Z",
  );
  assert.equal(
    create.body.deadlineType,
    "fdea.s6.annual-certification",
  );
  assert.equal(
    create.body
      .recurrenceIntervalSeconds,
    undefined,
  );
  assert.equal(
    create.body.metadata
      .federalEncryption
      .fixedSecondRecurrence,
    false,
  );

  await manager
    .scheduleAnnualCertification({
      agencyResourceId:
        AGENCY,
      reportingYear:
        2027,
      ombDueAt:
        "2027-12-15T17:00:00.000Z",
      ombDirectiveReference:
        "OMB-M-27-TEST",
      createdByPrincipalId:
        "compliance-officer",
    });
  assert.equal(
    engine.calls.filter(
      (call) =>
        call.method ===
          "POST" &&
        call.pathname ===
          "/v1/deadlines",
    ).length,
    1,
  );

  await assert.rejects(
    manager
      .scheduleAnnualCertification({
        agencyResourceId:
          AGENCY,
        reportingYear:
          2027,
        ombDueAt:
          "2027-12-20T17:00:00.000Z",
        ombDirectiveReference:
          "OMB-M-27-REVISED",
        createdByPrincipalId:
          "compliance-officer",
      }),
    /different dueAt/,
  );

  await assert.rejects(
    manager
      .scheduleAnnualCertification({
        agencyResourceId:
          AGENCY,
        reportingYear:
          2027,
        ombDueAt:
          "2028-01-01T00:00:00.000Z",
        ombDirectiveReference:
          "OMB-BAD",
        createdByPrincipalId:
          "compliance-officer",
      }),
    /reportingYear/,
  );
});

test("quarterly progress uses three calendar months and OMB/IG clocks use explicit dates", async () => {
  const engine =
    fakeEngine();
  const manager =
    managerWith(engine);

  await manager
    .scheduleQuarterlyNoncomplianceUpdate({
      agencyResourceId:
        AGENCY,
      previousReportAt:
        "2027-01-31T09:15:00.000Z",
      sequence:
        1,
      noncomplianceReference:
        "CERT-2026",
      createdByPrincipalId:
        "compliance-officer",
    });

  let create =
    lastCreate(engine);
  assert.equal(
    create.body.dueAt,
    "2027-04-30T09:15:00.000Z",
  );
  assert.equal(
    create.body.metadata
      .federalEncryption
      .fixedSecondRecurrence,
    false,
  );
  assert.equal(
    create.body
      .recurrenceIntervalSeconds,
    undefined,
  );

  await manager
    .scheduleOmbCorrectiveActionMilestone({
      agencyResourceId:
        AGENCY,
      correctiveActionPlanReference:
        "CAP-27-4",
      milestoneId:
        "M2",
      milestoneDescription:
        "Complete key-management migration",
      dueAt:
        "2027-08-10T20:00:00.000Z",
      createdByPrincipalId:
        "omb-operator",
    });

  create =
    lastCreate(engine);
  assert.equal(
    create.body.dueAt,
    "2027-08-10T20:00:00.000Z",
  );
  assert.equal(
    create.body.metadata
      .federalEncryption
      .dueDateSource,
    "OMB-approved-corrective-action-plan",
  );

  await manager
    .scheduleInspectorGeneralReview({
      agencyResourceId:
        AGENCY,
      reviewId:
        "FISMA-2027",
      reviewFrameworkReference:
        "FY2027 FISMA review calendar",
      dueAt:
        "2027-09-30T16:00:00.000Z",
      createdByPrincipalId:
        "ig-operator",
    });

  create =
    lastCreate(engine);
  assert.equal(
    create.body.metadata
      .federalEncryption
      .inventedStatutoryInterval,
    false,
  );
  assert.equal(
    create.body
      .recurrenceIntervalSeconds,
    undefined,
  );
});

test("status and completion stay on typed deadline SDK routes", async () => {
  const engine =
    fakeEngine();
  const manager =
    managerWith(engine);

  const scheduled =
    await manager
      .scheduleAnnualCertification({
        agencyResourceId:
          AGENCY,
        reportingYear:
          2027,
        ombDueAt:
          "2027-12-15T17:00:00.000Z",
        ombDirectiveReference:
          "OMB-M-27-TEST",
        createdByPrincipalId:
          "compliance-officer",
      });
  const id =
    scheduled.deadline.id;

  const status =
    await manager
      .getOversightDeadlineStatus(
        id,
        "2027-12-01T00:00:00.000Z",
      );
  assert.equal(
    status.status,
    "scheduled",
  );

  const completed =
    await manager
      .completeOversightDeadline(
        id,
        {
          principalId:
            "agency-head",
          satisfiedAt:
            "2027-12-14T16:00:00.000Z",
          correlationId:
            "cert-complete",
        },
      );
  assert.equal(
    completed.deadline.status,
    "satisfied",
  );

  assert.equal(
    engine.calls.some(
      (call) =>
        call.pathname.endsWith(
          "/status",
        ) &&
        call.searchParams.get(
          "at",
        ) ===
          "2027-12-01T00:00:00.000Z",
    ),
    true,
  );
  assert.equal(
    engine.calls.some(
      (call) =>
        call.method ===
          "POST" &&
        call.pathname.endsWith(
          "/satisfy",
        ),
    ),
    true,
  );
});

type RecordedCall = {
  method: string;
  pathname: string;
  searchParams: URLSearchParams;
  body: any;
};

type FakeEngine = {
  fetchImpl: typeof fetch;
  calls: RecordedCall[];
};

function managerWith(
  engine: FakeEngine,
) {
  return new FederalOversightManager({
    baseUrl:
      "https://engine.example.gov",
    organizationId:
      ORG,
    operatorToken:
      "caiau_test_operator",
    enactmentAt:
      "2026-01-01T00:00:00.000Z",
    enactmentReference:
      "Public Law test reference",
    fetchImpl:
      engine.fetchImpl,
  });
}

function fakeEngine(): FakeEngine {
  const calls:
    RecordedCall[] = [];
  const records =
    new Map<
      string,
      any
    >();
  let sequence =
    0;

  const fetchImpl:
    typeof fetch =
    async (
      input,
      init,
    ) => {
      const url =
        new URL(
          String(input),
        );
      const method =
        init?.method ??
        "GET";
      const body =
        init?.body
          ? JSON.parse(
              String(
                init.body,
              ),
            )
          : null;

      calls.push({
        method,
        pathname:
          url.pathname,
        searchParams:
          url.searchParams,
        body,
      });

      if (
        method === "GET" &&
        url.pathname.includes(
          "/subjects/",
        ) &&
        url.pathname.endsWith(
          "/deadlines",
        )
      ) {
        const marker =
          "/subjects/";
        const tail =
          url.pathname.slice(
            url.pathname.indexOf(
              marker,
            ) +
              marker.length,
          );
        const segments =
          tail.split("/");
        const subjectType =
          decodeURIComponent(
            segments[0]!,
          );
        const subjectId =
          decodeURIComponent(
            segments[1]!,
          );

        return json(
          [...records.values()]
            .map(
              (view) =>
                view.deadline,
            )
            .filter(
              (deadline) =>
                deadline.subjectType ===
                  subjectType &&
                deadline.subjectId ===
                  subjectId,
            ),
        );
      }

      if (
        method === "POST" &&
        url.pathname ===
          "/v1/deadlines"
      ) {
        sequence += 1;
        const id =
          "deadline-" +
          sequence;
        const deadline = {
          id,
          organizationId:
            body.organizationId,
          resourceId:
            body.resourceId ??
            null,
          subjectType:
            body.subjectType,
          subjectId:
            body.subjectId,
          deadlineType:
            body.deadlineType,
          status:
            "scheduled",
          createdByPrincipalId:
            body.createdByPrincipalId ??
            null,
          anchorAt:
            body.anchorAt ??
            null,
          dueOffsetSeconds:
            body.dueAfterSeconds ??
            null,
          dueAt:
            body.dueAt,
          warningWindowSeconds:
            body.warningWindowSeconds ??
            0,
          gracePeriodSeconds:
            body.gracePeriodSeconds ??
            0,
          recurrenceIntervalSeconds:
            body.recurrenceIntervalSeconds ??
            null,
          recurrenceEndAt:
            body.recurrenceEndAt ??
            null,
          maxOccurrences:
            body.maxOccurrences ??
            null,
          cycleNumber:
            1,
          escalationAfterSeconds:
            body.escalationAfterSeconds ??
            [],
          escalationLevel:
            0,
          satisfiedAt:
            null,
          createdAt:
            "2026-01-01T00:00:00.000Z",
          updatedAt:
            "2026-01-01T00:00:00.000Z",
          metadata:
            body.metadata ??
            {},
        };
        const view =
          deadlineView(
            deadline,
          );
        records.set(
          id,
          view,
        );
        return json(
          view,
          201,
        );
      }

      const statusMatch =
        url.pathname.match(
          /^\/v1\/deadlines\/([^/]+)\/status$/,
        );

      if (
        method === "GET" &&
        statusMatch
      ) {
        const id =
          decodeURIComponent(
            statusMatch[1]!,
          );
        const view =
          records.get(id);

        if (!view) {
          return json(
            {
              error:
                "not_found",
            },
            404,
          );
        }

        return json({
          status:
            view.deadline
              .status,
          escalationLevel:
            0,
          warningAt:
            view.deadline
              .dueAt,
          dueAt:
            view.deadline
              .dueAt,
          overdueAt:
            view.deadline
              .dueAt,
        });
      }

      const satisfyMatch =
        url.pathname.match(
          /^\/v1\/deadlines\/([^/]+)\/satisfy$/,
        );

      if (
        method === "POST" &&
        satisfyMatch
      ) {
        const id =
          decodeURIComponent(
            satisfyMatch[1]!,
          );
        const view =
          records.get(id);
        view.deadline.status =
          "satisfied";
        view.deadline.satisfiedAt =
          body.satisfiedAt ??
          "2027-12-14T16:00:00.000Z";
        view.clock =
          null;
        return json(view);
      }

      const getMatch =
        url.pathname.match(
          /^\/v1\/deadlines\/([^/]+)$/,
        );

      if (
        method === "GET" &&
        getMatch
      ) {
        const id =
          decodeURIComponent(
            getMatch[1]!,
          );
        const view =
          records.get(id);
        return view
          ? json(view)
          : json(
              {
                error:
                  "not_found",
              },
              404,
            );
      }

      throw new Error(
        "unexpected request: " +
          method +
          " " +
          url.toString(),
      );
    };

  return {
    fetchImpl,
    calls,
  };
}

function deadlineView(
  deadline: any,
) {
  return {
    deadline,
    clock: {
      status:
        "scheduled",
      escalationLevel:
        0,
      warningAt:
        deadline.dueAt,
      dueAt:
        deadline.dueAt,
      overdueAt:
        deadline.dueAt,
    },
    occurrences: [],
  };
}

function lastCreate(
  engine: FakeEngine,
): RecordedCall {
  const calls =
    engine.calls.filter(
      (call) =>
        call.method ===
          "POST" &&
        call.pathname ===
          "/v1/deadlines",
    );

  return calls[
    calls.length - 1
  ]!;
}

function json(
  value: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(value),
    {
      status,
      headers: {
        "content-type":
          "application/json",
      },
    },
  );
}
