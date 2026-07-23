import { describe, expect, it } from "vitest";

import { computeAverageDailyExpenseCents, computeCategorySlices } from "./derived";

describe("computeAverageDailyExpenseCents", () => {
  it("divides evenly across the month's days", () => {
    expect(computeAverageDailyExpenseCents(31000, "2026-07")).toBe(1000);
  });

  it("rounds to the nearest cent", () => {
    // 2026-02 is a 28-day non-leap February: 1000 / 28 = 35.71...
    expect(computeAverageDailyExpenseCents(1000, "2026-02")).toBe(36);
  });

  it("accounts for leap years", () => {
    expect(computeAverageDailyExpenseCents(2900, "2028-02")).toBe(100);
  });

  it("returns zero for zero expenses", () => {
    expect(computeAverageDailyExpenseCents(0, "2026-07")).toBe(0);
  });
});

describe("computeCategorySlices", () => {
  it("computes fractions that sum to exactly 1", () => {
    const slices = computeCategorySlices([
      { categoryId: "a", name: "Moradia", color: "#111", amountCents: 5000 },
      { categoryId: "b", name: "Mercado", color: "#222", amountCents: 3000 },
      { categoryId: "c", name: "Lazer", color: "#333", amountCents: 2000 },
    ]);
    expect(slices).toHaveLength(3);
    const total = slices.reduce((sum, slice) => sum + slice.fraction, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it("assigns proportional fractions", () => {
    const slices = computeCategorySlices([
      { categoryId: "a", name: "A", color: "#111", amountCents: 7500 },
      { categoryId: "b", name: "B", color: "#222", amountCents: 2500 },
    ]);
    expect(slices[0]?.fraction).toBeCloseTo(0.75, 10);
    expect(slices[1]?.fraction).toBeCloseTo(0.25, 10);
  });

  it("drops zero and negative entries", () => {
    const slices = computeCategorySlices([
      { categoryId: "a", name: "A", color: "#111", amountCents: 1000 },
      { categoryId: "b", name: "B", color: "#222", amountCents: 0 },
      { categoryId: "c", name: "C", color: "#333", amountCents: -500 },
    ]);
    expect(slices).toHaveLength(1);
    expect(slices[0]?.fraction).toBe(1);
  });

  it("returns an empty array when total is zero", () => {
    expect(computeCategorySlices([])).toEqual([]);
    expect(
      computeCategorySlices([{ categoryId: "a", name: "A", color: "#111", amountCents: 0 }]),
    ).toEqual([]);
  });

  it("still sums to 1 with many uneven slices", () => {
    const entries = Array.from({ length: 7 }, (_, i) => ({
      categoryId: String(i),
      name: `Cat ${i}`,
      color: "#000",
      amountCents: 137 * (i + 1),
    }));
    const slices = computeCategorySlices(entries);
    const total = slices.reduce((sum, slice) => sum + slice.fraction, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});
