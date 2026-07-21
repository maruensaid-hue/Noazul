import { describe, expect, it } from "vitest";

import {
  budgetProgressFraction,
  isBudgetOverspent,
  mergeBudgetOverview,
  remainingBudgetCents,
} from "./overview";

const categories = [
  { id: "cat-moradia", name: "Moradia", color: "#111" },
  { id: "cat-mercado", name: "Mercado", color: "#222" },
  { id: "cat-lazer", name: "Lazer", color: "#333" },
];

describe("mergeBudgetOverview", () => {
  it("merges category + budget + spent for every category", () => {
    const budgets = [{ id: "b1", categoryId: "cat-moradia", limitCents: 150000 }];
    const spent = new Map([
      ["cat-moradia", 120000],
      ["cat-mercado", 30000],
    ]);
    const result = mergeBudgetOverview(categories, budgets, spent);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      categoryId: "cat-moradia",
      categoryName: "Moradia",
      categoryColor: "#111",
      budgetId: "b1",
      limitCents: 150000,
      spentCents: 120000,
    });
    // Has spend but no budget.
    expect(result[1]).toMatchObject({ categoryId: "cat-mercado", budgetId: null, limitCents: null, spentCents: 30000 });
    // Has neither budget nor spend.
    expect(result[2]).toMatchObject({ categoryId: "cat-lazer", budgetId: null, limitCents: null, spentCents: 0 });
  });

  it("handles no categories, no budgets, no spend", () => {
    expect(mergeBudgetOverview([], [], new Map())).toEqual([]);
  });

  it("ignores a budget for a category not in the category list", () => {
    const budgets = [{ id: "b1", categoryId: "ghost-category", limitCents: 1000 }];
    const result = mergeBudgetOverview(categories, budgets, new Map());
    expect(result.every((entry) => entry.budgetId === null)).toBe(true);
  });
});

describe("remainingBudgetCents", () => {
  it("returns null when there is no budget", () => {
    expect(
      remainingBudgetCents({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: null,
        limitCents: null,
        spentCents: 500,
      }),
    ).toBeNull();
  });

  it("returns positive remaining when under budget", () => {
    expect(
      remainingBudgetCents({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: "b",
        limitCents: 10000,
        spentCents: 6000,
      }),
    ).toBe(4000);
  });

  it("returns negative when overspent", () => {
    expect(
      remainingBudgetCents({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: "b",
        limitCents: 10000,
        spentCents: 12000,
      }),
    ).toBe(-2000);
  });
});

describe("isBudgetOverspent", () => {
  it("is false without a budget", () => {
    expect(
      isBudgetOverspent({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: null,
        limitCents: null,
        spentCents: 999999,
      }),
    ).toBe(false);
  });

  it("is false exactly at the limit", () => {
    expect(
      isBudgetOverspent({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: "b",
        limitCents: 10000,
        spentCents: 10000,
      }),
    ).toBe(false);
  });

  it("is true one cent over the limit", () => {
    expect(
      isBudgetOverspent({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: "b",
        limitCents: 10000,
        spentCents: 10001,
      }),
    ).toBe(true);
  });
});

describe("budgetProgressFraction", () => {
  it("is 0 without a budget", () => {
    expect(
      budgetProgressFraction({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: null,
        limitCents: null,
        spentCents: 500,
      }),
    ).toBe(0);
  });

  it("is proportional under budget", () => {
    expect(
      budgetProgressFraction({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: "b",
        limitCents: 10000,
        spentCents: 2500,
      }),
    ).toBeCloseTo(0.25, 10);
  });

  it("clamps at 1 when overspent, never overflowing the bar", () => {
    expect(
      budgetProgressFraction({
        categoryId: "a",
        categoryName: "A",
        categoryColor: "#000",
        budgetId: "b",
        limitCents: 10000,
        spentCents: 25000,
      }),
    ).toBe(1);
  });
});
