import { and, eq, isNull, like } from "drizzle-orm";

import { db } from "../../db/client";
import { budgets, categories, profiles, transactions } from "../../db/schema";
import { nowIso } from "../../lib/dates";
import { transactionsToCsv } from "./csv";
import type { BackupData } from "./schema";

export type CsvScope = { type: "month"; yearMonth: string } | { type: "year"; year: number } | { type: "all" };

/** CSV of every lançamento in `scope`, ordered by due date — for opening in Excel/Sheets. */
export async function exportTransactionsCsv(profileId: string, scope: CsvScope): Promise<string> {
  const scopeFilter =
    scope.type === "month"
      ? like(transactions.dueDate, `${scope.yearMonth}-%`)
      : scope.type === "year"
        ? like(transactions.dueDate, `${scope.year}-%`)
        : undefined;

  const rows = await db
    .select({
      name: transactions.name,
      categoryName: categories.name,
      type: transactions.type,
      status: transactions.status,
      amountCents: transactions.amountCents,
      dueDate: transactions.dueDate,
      installmentNo: transactions.installmentNo,
      installmentOf: transactions.installmentOf,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(eq(transactions.profileId, profileId), isNull(transactions.deletedAt), scopeFilter),
    )
    .orderBy(transactions.dueDate);

  return transactionsToCsv(
    rows.map((row) => ({ ...row, categoryName: row.categoryName ?? "Sem categoria" })),
  );
}

/** Full local-DB snapshot (every profile) for the "Backup completo" share action. Excludes soft-deleted rows. */
export async function buildBackupData(): Promise<BackupData> {
  const [profileRows, categoryRows, transactionRows, budgetRows] = await Promise.all([
    db.select().from(profiles).where(isNull(profiles.deletedAt)),
    db.select().from(categories).where(isNull(categories.deletedAt)),
    db.select().from(transactions).where(isNull(transactions.deletedAt)),
    db.select().from(budgets).where(isNull(budgets.deletedAt)),
  ]);

  return {
    version: 1,
    exportedAt: nowIso(),
    profiles: profileRows.map((row) => ({
      id: row.id,
      name: row.name,
      isDefault: row.isDefault,
      updatedAt: row.updatedAt,
    })),
    categories: categoryRows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      name: row.name,
      color: row.color,
      updatedAt: row.updatedAt,
    })),
    transactions: transactionRows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      categoryId: row.categoryId,
      name: row.name,
      type: row.type,
      status: row.status,
      amountCents: row.amountCents,
      dueDate: row.dueDate,
      paidAt: row.paidAt,
      recurrenceId: row.recurrenceId,
      installmentNo: row.installmentNo,
      installmentOf: row.installmentOf,
      updatedAt: row.updatedAt,
    })),
    budgets: budgetRows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      categoryId: row.categoryId,
      yearMonth: row.yearMonth,
      limitCents: row.limitCents,
      updatedAt: row.updatedAt,
    })),
  };
}

/**
 * Replaces ALL local data with `data` — wipes every table first, then
 * reinserts parent-before-child (SQLite's `foreign_keys` pragma is never
 * enabled here, so `ON DELETE CASCADE` doesn't fire; this does the ordering
 * by hand instead). Caller is responsible for confirming with the user first
 * — this is destructive and cannot be undone.
 */
export async function restoreBackupData(data: BackupData): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(budgets);
    await tx.delete(transactions);
    await tx.delete(categories);
    await tx.delete(profiles);

    for (const profile of data.profiles) {
      await tx.insert(profiles).values({ ...profile, deletedAt: null });
    }
    for (const category of data.categories) {
      await tx.insert(categories).values({ ...category, deletedAt: null });
    }
    for (const transaction of data.transactions) {
      await tx.insert(transactions).values({ ...transaction, deletedAt: null });
    }
    for (const budget of data.budgets) {
      await tx.insert(budgets).values({ ...budget, deletedAt: null });
    }
  });
}
