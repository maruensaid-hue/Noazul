import { daysInMonth, parseYearMonth } from "../../lib/dates";
import { sumCents } from "../../lib/money";

/**
 * Committed expenses spread evenly across the month's days — a simple daily
 * run-rate, not tied to "today" so it stays deterministic and testable.
 */
export function computeAverageDailyExpenseCents(expenseTotalCents: number, yearMonth: string): number {
  const days = daysInMonth(parseYearMonth(yearMonth));
  return Math.round(expenseTotalCents / days);
}

export interface CategoryAmount {
  categoryId: string | null;
  name: string;
  color: string;
  amountCents: number;
}

export interface CategorySlice extends CategoryAmount {
  /** Fraction of the total, in [0, 1]. Slices always sum to exactly 1 (when total > 0). */
  fraction: number;
}

/**
 * Converts category totals into donut-chart slices. Zero/negative entries are
 * dropped (nothing to draw) and, since `fraction` is amountCents/total for
 * every kept entry, the fractions sum to exactly 1 by construction.
 */
export function computeCategorySlices(entries: readonly CategoryAmount[]): CategorySlice[] {
  const positiveEntries = entries.filter((entry) => entry.amountCents > 0);
  const total = sumCents(positiveEntries.map((entry) => entry.amountCents));
  if (total <= 0) {
    return [];
  }
  return positiveEntries.map((entry) => ({ ...entry, fraction: entry.amountCents / total }));
}
