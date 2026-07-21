import { and, eq, isNull, like } from "drizzle-orm";

import { db } from "../../db/client";
import { budgets, categories, transactions } from "../../db/schema";
import { nowIso, shiftYearMonth } from "../../lib/dates";
import { newId } from "../../lib/id";
import { mergeBudgetOverview, type BudgetOverviewEntry } from "./overview";

async function listBudgetsForMonth(
  profileId: string,
  yearMonth: string,
): Promise<{ id: string; categoryId: string; limitCents: number }[]> {
  return db
    .select({ id: budgets.id, categoryId: budgets.categoryId, limitCents: budgets.limitCents })
    .from(budgets)
    .where(
      and(eq(budgets.profileId, profileId), eq(budgets.yearMonth, yearMonth), isNull(budgets.deletedAt)),
    );
}

async function getSpentByCategory(
  profileId: string,
  yearMonth: string,
): Promise<Map<string, number>> {
  const rows = await db
    .select({ categoryId: transactions.categoryId, spentCents: transactions.amountCents })
    .from(transactions)
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.type, "EXPENSE"),
        isNull(transactions.deletedAt),
        like(transactions.dueDate, `${yearMonth}-%`),
      ),
    );

  const spentByCategory = new Map<string, number>();
  for (const row of rows) {
    if (!row.categoryId) continue;
    spentByCategory.set(row.categoryId, (spentByCategory.get(row.categoryId) ?? 0) + row.spentCents);
  }
  return spentByCategory;
}

export async function listBudgetOverview(
  profileId: string,
  yearMonth: string,
): Promise<BudgetOverviewEntry[]> {
  const [categoryRows, budgetRows, spentByCategory] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name, color: categories.color })
      .from(categories)
      .where(and(eq(categories.profileId, profileId), isNull(categories.deletedAt))),
    listBudgetsForMonth(profileId, yearMonth),
    getSpentByCategory(profileId, yearMonth),
  ]);

  return mergeBudgetOverview(categoryRows, budgetRows, spentByCategory);
}

/** Insert-or-update by (profileId, categoryId, yearMonth) — also revives a soft-deleted budget. */
export async function upsertBudget(
  profileId: string,
  categoryId: string,
  yearMonth: string,
  limitCents: number,
): Promise<void> {
  await db
    .insert(budgets)
    .values({ id: newId(), profileId, categoryId, yearMonth, limitCents })
    .onConflictDoUpdate({
      target: [budgets.profileId, budgets.categoryId, budgets.yearMonth],
      set: { limitCents, deletedAt: null, updatedAt: nowIso() },
    });
}

export async function deleteBudget(id: string): Promise<void> {
  await db
    .update(budgets)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(budgets.id, id));
}

/**
 * Copies last month's budgets into `yearMonth`, one tap (Fase 3 task 4).
 * Only fills gaps — a category the user already budgeted this month is left
 * alone. Returns how many budgets were copied.
 */
export async function copyBudgetsFromPreviousMonth(
  profileId: string,
  yearMonth: string,
): Promise<number> {
  const previousYearMonth = shiftYearMonth(yearMonth, -1);
  const [previousBudgets, currentBudgets] = await Promise.all([
    listBudgetsForMonth(profileId, previousYearMonth),
    listBudgetsForMonth(profileId, yearMonth),
  ]);

  const alreadyBudgeted = new Set(currentBudgets.map((budget) => budget.categoryId));
  const toCopy = previousBudgets.filter((budget) => !alreadyBudgeted.has(budget.categoryId));
  if (toCopy.length === 0) return 0;

  await db.transaction(async (tx) => {
    for (const budget of toCopy) {
      await tx
        .insert(budgets)
        .values({
          id: newId(),
          profileId,
          categoryId: budget.categoryId,
          yearMonth,
          limitCents: budget.limitCents,
        })
        .onConflictDoUpdate({
          target: [budgets.profileId, budgets.categoryId, budgets.yearMonth],
          set: { limitCents: budget.limitCents, deletedAt: null, updatedAt: nowIso() },
        });
    }
  });

  return toCopy.length;
}
