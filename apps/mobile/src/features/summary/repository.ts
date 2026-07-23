import { and, desc, eq, isNull, like, sql } from "drizzle-orm";

import { db } from "../../db/client";
import { categories, transactions } from "../../db/schema";
import { formatYearMonth } from "../../lib/dates";
import { sumCents } from "../../lib/money";
import { computeAverageDailyExpenseCents, type CategoryAmount } from "./derived";

export interface MonthSummary {
  /** Sum of all INCOME transactions this month. */
  incomeCents: number;
  /** Sum of all EXPENSE transactions this month, paid or pending. */
  expenseTotalCents: number;
  /** Sum of EXPENSE transactions already marked PAID. */
  expensePaidCents: number;
  /** Sum of EXPENSE transactions still PENDING — "falta pagar". */
  expensePendingCents: number;
  /** Income minus every committed expense (paid + pending) — "saldo seguro". */
  safeBalanceCents: number;
  /** expenseTotalCents spread evenly across the month's days. */
  averageDailyExpenseCents: number;
}

export async function getMonthSummary(
  profileId: string,
  yearMonth: string,
): Promise<MonthSummary> {
  const [row] = await db
    .select({
      incomeCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amountCents} else 0 end), 0)`,
      expenseTotalCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amountCents} else 0 end), 0)`,
      expensePaidCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' and ${transactions.status} = 'PAID' then ${transactions.amountCents} else 0 end), 0)`,
      expensePendingCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' and ${transactions.status} = 'PENDING' then ${transactions.amountCents} else 0 end), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.profileId, profileId),
        isNull(transactions.deletedAt),
        like(transactions.dueDate, `${yearMonth}-%`),
      ),
    );

  const incomeCents = row?.incomeCents ?? 0;
  const expenseTotalCents = row?.expenseTotalCents ?? 0;
  const expensePaidCents = row?.expensePaidCents ?? 0;
  const expensePendingCents = row?.expensePendingCents ?? 0;

  return {
    incomeCents,
    expenseTotalCents,
    expensePaidCents,
    expensePendingCents,
    safeBalanceCents: sumCents([incomeCents, -expenseTotalCents]),
    averageDailyExpenseCents: computeAverageDailyExpenseCents(expenseTotalCents, yearMonth),
  };
}

/** EXPENSE totals (paid + pending) grouped by category, for the donut chart. */
export async function getMonthCategoryBreakdown(
  profileId: string,
  yearMonth: string,
): Promise<CategoryAmount[]> {
  const rows = await db
    .select({
      categoryId: transactions.categoryId,
      name: categories.name,
      color: categories.color,
      amountCents: sql<number>`sum(${transactions.amountCents})`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.type, "EXPENSE"),
        isNull(transactions.deletedAt),
        like(transactions.dueDate, `${yearMonth}-%`),
      ),
    )
    .groupBy(transactions.categoryId, categories.name, categories.color)
    .orderBy(desc(sql`sum(${transactions.amountCents})`));

  return rows.map((row) => ({
    categoryId: row.categoryId,
    name: row.name ?? "Sem categoria",
    color: row.color ?? "#9CA3AF",
    amountCents: row.amountCents,
  }));
}

export interface YearMonthAmounts {
  yearMonth: string;
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
}

export interface YearSummary {
  year: number;
  /** Always 12 entries, Janeiro→Dezembro, zero-filled for months with no transactions. */
  months: YearMonthAmounts[];
  totalIncomeCents: number;
  totalExpenseCents: number;
  totalBalanceCents: number;
}

/** Month-by-month income/expense/balance for the whole year — feeds the annual dashboard's bar chart. */
export async function getYearSummary(profileId: string, year: number): Promise<YearSummary> {
  const rows = await db
    .select({
      yearMonth: sql<string>`substr(${transactions.dueDate}, 1, 7)`,
      incomeCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amountCents} else 0 end), 0)`,
      expenseCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amountCents} else 0 end), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.profileId, profileId),
        isNull(transactions.deletedAt),
        like(transactions.dueDate, `${year}-%`),
      ),
    )
    .groupBy(sql`substr(${transactions.dueDate}, 1, 7)`);

  const byYearMonth = new Map(rows.map((row) => [row.yearMonth, row]));

  const months: YearMonthAmounts[] = Array.from({ length: 12 }, (_, index) => {
    const yearMonth = formatYearMonth({ year, month: index + 1 });
    const row = byYearMonth.get(yearMonth);
    const incomeCents = row?.incomeCents ?? 0;
    const expenseCents = row?.expenseCents ?? 0;
    return { yearMonth, incomeCents, expenseCents, balanceCents: sumCents([incomeCents, -expenseCents]) };
  });

  return {
    year,
    months,
    totalIncomeCents: sumCents(months.map((month) => month.incomeCents)),
    totalExpenseCents: sumCents(months.map((month) => month.expenseCents)),
    totalBalanceCents: sumCents(months.map((month) => month.balanceCents)),
  };
}

/** EXPENSE totals (paid + pending) grouped by category, for the whole year — feeds the year donut chart. */
export async function getYearCategoryBreakdown(
  profileId: string,
  year: number,
): Promise<CategoryAmount[]> {
  const rows = await db
    .select({
      categoryId: transactions.categoryId,
      name: categories.name,
      color: categories.color,
      amountCents: sql<number>`sum(${transactions.amountCents})`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.type, "EXPENSE"),
        isNull(transactions.deletedAt),
        like(transactions.dueDate, `${year}-%`),
      ),
    )
    .groupBy(transactions.categoryId, categories.name, categories.color)
    .orderBy(desc(sql`sum(${transactions.amountCents})`));

  return rows.map((row) => ({
    categoryId: row.categoryId,
    name: row.name ?? "Sem categoria",
    color: row.color ?? "#9CA3AF",
    amountCents: row.amountCents,
  }));
}
