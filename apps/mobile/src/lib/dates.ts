/**
 * Month is always represented as a "YYYY-MM" string (see noazul-blueprint.md §3.3/§5).
 * Stored dates are UTC; formatting for display happens at the UI boundary.
 */

const YEAR_MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export interface YearMonthParts {
  year: number;
  /** 1-12 */
  month: number;
}

export function isValidYearMonth(value: string): boolean {
  return YEAR_MONTH_RE.test(value);
}

export function parseYearMonth(value: string): YearMonthParts {
  const match = YEAR_MONTH_RE.exec(value);
  if (!match) {
    throw new TypeError(`Invalid yearMonth "${value}", expected "YYYY-MM"`);
  }
  return { year: Number(match[1]), month: Number(match[2]) };
}

export function formatYearMonth(parts: YearMonthParts): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}`;
}

/** Returns the current month as a "YYYY-MM" string, in UTC. */
export function currentYearMonth(now: Date = new Date()): string {
  return formatYearMonth({ year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 });
}

/** Shifts a "YYYY-MM" string by `delta` months (can be negative), handling year rollover. */
export function shiftYearMonth(value: string, delta: number): string {
  const { year, month } = parseYearMonth(value);
  const zeroBasedTotal = (month - 1) + delta;
  const newYear = year + Math.floor(zeroBasedTotal / 12);
  const newMonth = ((zeroBasedTotal % 12) + 12) % 12;
  return formatYearMonth({ year: newYear, month: newMonth + 1 });
}

export function daysInMonth({ year, month }: YearMonthParts): number {
  // Day 0 of next month == last day of this month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Human-readable label for a "YYYY-MM" string, e.g. "2026-07" -> "julho de 2026". */
export function yearMonthLabel(value: string): string {
  const { year, month } = parseYearMonth(value);
  return MONTH_LABEL_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1)));
}

/** Extracts the "YYYY-MM" bucket a given ISO date/datetime string belongs to. */
export function yearMonthOf(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`yearMonthOf received an invalid date string "${isoDate}"`);
  }
  return currentYearMonth(date);
}

const DATE_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function isValidDateString(value: string): boolean {
  return DATE_RE.test(value);
}

/** Today as a "YYYY-MM-DD" string, in UTC. */
export function todayDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Current instant as an ISO-8601 datetime string (always UTC). */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Shifts a "YYYY-MM-DD" date by `deltaMonths` months, clamping the day to the
 * target month's last day (e.g. "2026-01-31" + 1 month -> "2026-02-28").
 * Used both for moving a single transaction and, later, recurrence materialization.
 */
export function shiftDateByMonths(dateStr: string, deltaMonths: number): string {
  const match = DATE_RE.exec(dateStr);
  if (!match) {
    throw new TypeError(`Invalid date "${dateStr}", expected "YYYY-MM-DD"`);
  }
  const [, yearStr, monthStr, dayStr] = match;
  const sourceYearMonth = formatYearMonth({ year: Number(yearStr), month: Number(monthStr) });
  const targetYearMonth = shiftYearMonth(sourceYearMonth, deltaMonths);
  const targetParts = parseYearMonth(targetYearMonth);
  const clampedDay = Math.min(Number(dayStr), daysInMonth(targetParts));
  return `${targetYearMonth}-${String(clampedDay).padStart(2, "0")}`;
}

/**
 * Converts a "YYYY-MM-DD" string to a Date using LOCAL calendar components
 * (not UTC). Use this to feed native date pickers: parsing the string as UTC
 * and letting the picker render it in local time would shift the displayed
 * day by one in negative UTC offsets (e.g. Brazil).
 */
export function localDateStringToDate(dateStr: string): Date {
  const match = DATE_RE.exec(dateStr);
  if (!match) {
    throw new TypeError(`Invalid date "${dateStr}", expected "YYYY-MM-DD"`);
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Inverse of `localDateStringToDate`: reads a Date's LOCAL calendar day as "YYYY-MM-DD". */
export function dateToLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
