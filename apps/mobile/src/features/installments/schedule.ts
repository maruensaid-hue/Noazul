import { formatYearMonth } from "../../lib/dates";

/** Strips the "(n/N)" suffix `generateInstallmentPlan` (lib/recurrence.ts) appends to each occurrence's name. */
export function stripInstallmentSuffix(name: string): string {
  return name.replace(/\s\(\d+\/\d+\)$/, "");
}

export interface InstallmentSeriesRow {
  recurrenceId: string;
  name: string;
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  installmentOf: number;
  installmentValueCents: number;
  firstDueDate: string;
}

export interface InstallmentSeriesTotal {
  recurrenceId: string;
  totalValueCents: number;
}

export interface InstallmentMonthlyAmount {
  recurrenceId: string;
  yearMonth: string;
  amountCents: number;
}

export interface InstallmentSeriesSummary {
  recurrenceId: string;
  baseName: string;
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  installmentOf: number;
  installmentValueCents: number;
  totalValueCents: number;
  firstDueDate: string;
  /** 12 entries, Janeiro→Dezembro, amount due that month within the requested year (0 if none). */
  monthlyAmountsCents: number[];
}

/**
 * Merges the three repository queries into one row per installment purchase
 * (mirrors the reference spreadsheet's "Cartão de Crédito" grid). Series with
 * nothing due in `year` are dropped — they don't belong in that year's view.
 */
export function buildInstallmentSchedule(
  year: number,
  series: readonly InstallmentSeriesRow[],
  totals: readonly InstallmentSeriesTotal[],
  monthly: readonly InstallmentMonthlyAmount[],
): InstallmentSeriesSummary[] {
  const totalBySeries = new Map(totals.map((total) => [total.recurrenceId, total.totalValueCents]));

  const monthlyBySeries = new Map<string, Map<string, number>>();
  for (const row of monthly) {
    const byMonth = monthlyBySeries.get(row.recurrenceId) ?? new Map<string, number>();
    byMonth.set(row.yearMonth, (byMonth.get(row.yearMonth) ?? 0) + row.amountCents);
    monthlyBySeries.set(row.recurrenceId, byMonth);
  }

  const summaries: InstallmentSeriesSummary[] = [];
  for (const entry of series) {
    const byMonth = monthlyBySeries.get(entry.recurrenceId);
    const monthlyAmountsCents = Array.from({ length: 12 }, (_, index) =>
      byMonth?.get(formatYearMonth({ year, month: index + 1 })) ?? 0,
    );
    if (monthlyAmountsCents.every((amount) => amount === 0)) continue;

    summaries.push({
      recurrenceId: entry.recurrenceId,
      baseName: stripInstallmentSuffix(entry.name),
      categoryId: entry.categoryId,
      categoryName: entry.categoryName,
      categoryColor: entry.categoryColor,
      installmentOf: entry.installmentOf,
      installmentValueCents: entry.installmentValueCents,
      totalValueCents: totalBySeries.get(entry.recurrenceId) ?? entry.installmentValueCents * entry.installmentOf,
      firstDueDate: entry.firstDueDate,
      monthlyAmountsCents,
    });
  }
  return summaries;
}
