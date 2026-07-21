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
