const DAY_MS =
  24 * 60 * 60 * 1000;

export type StatutoryEnactmentDates = {
  nistGuidanceDueAt: string;
  agencyImplementationDueAt: string;
  existingContractTransitionDueAt: string;
  gaoEvaluationDueAt: string;
};

export function calculateStatutoryEnactmentDates(
  enactmentAt: string,
): StatutoryEnactmentDates {
  const enacted =
    parseDateTime(
      enactmentAt,
      "enactmentAt",
    );

  return {
    nistGuidanceDueAt:
      addUtcDays(
        enacted,
        180,
      ).toISOString(),
    agencyImplementationDueAt:
      addUtcCalendarMonths(
        enacted,
        12,
      ).toISOString(),
    existingContractTransitionDueAt:
      addUtcCalendarMonths(
        enacted,
        12,
      ).toISOString(),
    gaoEvaluationDueAt:
      addUtcCalendarMonths(
        enacted,
        18,
      ).toISOString(),
  };
}

export function nextQuarterlyUpdateDueAt(
  previousReportAt: string,
): string {
  return addUtcCalendarMonths(
    parseDateTime(
      previousReportAt,
      "previousReportAt",
    ),
    3,
  ).toISOString();
}

export function validateAnnualDueAt(
  dueAt: string,
  reportingYear: number,
): string {
  if (
    !Number.isInteger(
      reportingYear,
    ) ||
    reportingYear < 1900 ||
    reportingYear > 9999
  ) {
    throw new Error(
      "reportingYear must be a four-digit calendar year",
    );
  }

  const due =
    parseDateTime(
      dueAt,
      "ombDueAt",
    );

  if (
    due.getUTCFullYear() !==
    reportingYear
  ) {
    throw new Error(
      "OMB annual certification due date must fall within reportingYear and therefore no later than December 31",
    );
  }

  return due.toISOString();
}

export function normalizeDateTime(
  value: string,
  field: string,
): string {
  return parseDateTime(
    value,
    field,
  ).toISOString();
}

function addUtcDays(
  date: Date,
  days: number,
): Date {
  return new Date(
    date.getTime() +
      days * DAY_MS,
  );
}

function addUtcCalendarMonths(
  date: Date,
  months: number,
): Date {
  const year =
    date.getUTCFullYear();
  const month =
    date.getUTCMonth();
  const day =
    date.getUTCDate();
  const hour =
    date.getUTCHours();
  const minute =
    date.getUTCMinutes();
  const second =
    date.getUTCSeconds();
  const millisecond =
    date.getUTCMilliseconds();

  const targetFirst =
    new Date(
      Date.UTC(
        year,
        month + months,
        1,
        hour,
        minute,
        second,
        millisecond,
      ),
    );
  const lastDay =
    new Date(
      Date.UTC(
        targetFirst.getUTCFullYear(),
        targetFirst.getUTCMonth() + 1,
        0,
      ),
    ).getUTCDate();

  targetFirst.setUTCDate(
    Math.min(
      day,
      lastDay,
    ),
  );

  return targetFirst;
}

function parseDateTime(
  value: string,
  field: string,
): Date {
  if (
    typeof value !==
      "string" ||
    value.trim() ===
      ""
  ) {
    throw new Error(
      field +
        " is required",
    );
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    throw new Error(
      field +
        " must be a valid date-time",
    );
  }

  return parsed;
}
