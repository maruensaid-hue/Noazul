import { and, desc, eq, isNotNull, isNull, like, sql } from "drizzle-orm";

import { db } from "../../db/client";
import { categories, transactions } from "../../db/schema";
import {
  buildInstallmentSchedule,
  type InstallmentSeriesSummary,
} from "./schedule";

/** Every installment purchase (one row per series, taken from its 1st installment) plus its lifetime total and this year's monthly breakdown. */
export async function listInstallmentSchedule(
  profileId: string,
  year: number,
): Promise<InstallmentSeriesSummary[]> {
  const [seriesRows, totalRows, monthlyRows] = await Promise.all([
    db
      .select({
        recurrenceId: transactions.recurrenceId,
        name: transactions.name,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        installmentOf: transactions.installmentOf,
        installmentValueCents: transactions.amountCents,
        firstDueDate: transactions.dueDate,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.profileId, profileId),
          eq(transactions.installmentNo, 1),
          isNotNull(transactions.installmentOf),
          isNull(transactions.deletedAt),
        ),
      )
      .orderBy(desc(transactions.dueDate)),
    db
      .select({
        recurrenceId: transactions.recurrenceId,
        totalValueCents: sql<number>`sum(${transactions.amountCents})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.profileId, profileId),
          isNotNull(transactions.installmentOf),
          isNull(transactions.deletedAt),
        ),
      )
      .groupBy(transactions.recurrenceId),
    db
      .select({
        recurrenceId: transactions.recurrenceId,
        yearMonth: sql<string>`substr(${transactions.dueDate}, 1, 7)`,
        amountCents: sql<number>`sum(${transactions.amountCents})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.profileId, profileId),
          isNotNull(transactions.installmentOf),
          isNull(transactions.deletedAt),
          like(transactions.dueDate, `${year}-%`),
        ),
      )
      .groupBy(transactions.recurrenceId, sql`substr(${transactions.dueDate}, 1, 7)`),
  ]);

  return buildInstallmentSchedule(
    year,
    seriesRows.map((row) => ({
      recurrenceId: row.recurrenceId as string,
      name: row.name,
      categoryId: row.categoryId,
      categoryName: row.categoryName ?? "Sem categoria",
      categoryColor: row.categoryColor ?? "#9CA3AF",
      installmentOf: row.installmentOf as number,
      installmentValueCents: row.installmentValueCents,
      firstDueDate: row.firstDueDate,
    })),
    totalRows.map((row) => ({
      recurrenceId: row.recurrenceId as string,
      totalValueCents: row.totalValueCents,
    })),
    monthlyRows.map((row) => ({
      recurrenceId: row.recurrenceId as string,
      yearMonth: row.yearMonth,
      amountCents: row.amountCents,
    })),
  );
}
