export interface BudgetOverviewEntry {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  /** null when the category has no budget set for this month yet. */
  budgetId: string | null;
  limitCents: number | null;
  spentCents: number;
}

/**
 * Merges every profile category with (optionally) its budget for the month
 * and how much was actually spent — three independent queries combined in
 * plain JS so the SQL stays simple (see repository.ts).
 */
export function mergeBudgetOverview(
  categories: readonly { id: string; name: string; color: string }[],
  budgets: readonly { id: string; categoryId: string; limitCents: number }[],
  spentByCategory: ReadonlyMap<string, number>,
): BudgetOverviewEntry[] {
  const budgetByCategory = new Map(budgets.map((budget) => [budget.categoryId, budget]));

  return categories.map((category) => {
    const budget = budgetByCategory.get(category.id);
    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color,
      budgetId: budget?.id ?? null,
      limitCents: budget?.limitCents ?? null,
      spentCents: spentByCategory.get(category.id) ?? 0,
    };
  });
}

/** "Ainda pode gastar": negative once spending has overrun the limit. */
export function remainingBudgetCents(entry: BudgetOverviewEntry): number | null {
  if (entry.limitCents === null) return null;
  return entry.limitCents - entry.spentCents;
}

export function isBudgetOverspent(entry: BudgetOverviewEntry): boolean {
  return entry.limitCents !== null && entry.spentCents > entry.limitCents;
}

/** Progress-bar fill fraction, clamped to [0, 1] — overspend is signaled by color, not an overflowing bar. */
export function budgetProgressFraction(entry: BudgetOverviewEntry): number {
  if (entry.limitCents === null || entry.limitCents <= 0) return 0;
  return Math.min(entry.spentCents / entry.limitCents, 1);
}
