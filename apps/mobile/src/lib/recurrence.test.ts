import { describe, expect, it } from "vitest";

import {
  generateFixedRecurrencePlan,
  generateInstallmentPlan,
  MAX_INSTALLMENTS,
  MIN_INSTALLMENTS,
  RECURRENCE_MONTHS_AHEAD,
} from "./recurrence";

describe("generateFixedRecurrencePlan", () => {
  it("defaults to 12 months ahead, one per month, same name", () => {
    const plan = generateFixedRecurrencePlan("Aluguel", "2026-07-10");
    expect(plan).toHaveLength(RECURRENCE_MONTHS_AHEAD);
    expect(plan[0]).toEqual({
      dueDate: "2026-07-10",
      name: "Aluguel",
      installmentNo: null,
      installmentOf: null,
    });
    expect(plan.map((o) => o.dueDate)).toEqual([
      "2026-07-10",
      "2026-08-10",
      "2026-09-10",
      "2026-10-10",
      "2026-11-10",
      "2026-12-10",
      "2027-01-10",
      "2027-02-10",
      "2027-03-10",
      "2027-04-10",
      "2027-05-10",
      "2027-06-10",
    ]);
    expect(plan.every((o) => o.name === "Aluguel")).toBe(true);
  });

  it("clamps day 31 into shorter months, including February", () => {
    const plan = generateFixedRecurrencePlan("Assinatura", "2026-01-31", 4);
    expect(plan.map((o) => o.dueDate)).toEqual([
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
      "2026-04-30",
    ]);
  });

  it("clamps day 31 into a leap February", () => {
    const plan = generateFixedRecurrencePlan("Assinatura", "2028-01-31", 2);
    expect(plan.map((o) => o.dueDate)).toEqual(["2028-01-31", "2028-02-29"]);
  });

  it("respects a custom monthsAhead", () => {
    expect(generateFixedRecurrencePlan("X", "2026-01-01", 1)).toHaveLength(1);
    expect(generateFixedRecurrencePlan("X", "2026-01-01", 24)).toHaveLength(24);
  });

  it("throws on monthsAhead < 1", () => {
    expect(() => generateFixedRecurrencePlan("X", "2026-01-01", 0)).toThrow(RangeError);
  });

  it("throws on a non-integer monthsAhead", () => {
    expect(() => generateFixedRecurrencePlan("X", "2026-01-01", 1.5)).toThrow(RangeError);
  });
});

describe("generateInstallmentPlan", () => {
  it("creates exactly 10 installments labeled 1/10..10/10", () => {
    const plan = generateInstallmentPlan("Notebook", "2026-07-15", 10);
    expect(plan).toHaveLength(10);
    expect(plan.map((o) => o.name)).toEqual([
      "Notebook (1/10)",
      "Notebook (2/10)",
      "Notebook (3/10)",
      "Notebook (4/10)",
      "Notebook (5/10)",
      "Notebook (6/10)",
      "Notebook (7/10)",
      "Notebook (8/10)",
      "Notebook (9/10)",
      "Notebook (10/10)",
    ]);
    expect(plan.map((o) => o.installmentNo)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(plan.every((o) => o.installmentOf === 10)).toBe(true);
  });

  it("spaces installments one month apart, in the correct months", () => {
    const plan = generateInstallmentPlan("Notebook", "2026-07-15", 3);
    expect(plan.map((o) => o.dueDate)).toEqual(["2026-07-15", "2026-08-15", "2026-09-15"]);
  });

  it("clamps day 31 into shorter months, including February", () => {
    const plan = generateInstallmentPlan("Compra", "2026-01-31", 3);
    expect(plan.map((o) => o.dueDate)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
  });

  it("clamps day 31 into a leap February", () => {
    const plan = generateInstallmentPlan("Compra", "2028-01-31", 2);
    expect(plan.map((o) => o.dueDate)).toEqual(["2028-01-31", "2028-02-29"]);
  });

  it("accepts the boundary installment counts", () => {
    expect(generateInstallmentPlan("X", "2026-01-01", MIN_INSTALLMENTS)).toHaveLength(
      MIN_INSTALLMENTS,
    );
    expect(generateInstallmentPlan("X", "2026-01-01", MAX_INSTALLMENTS)).toHaveLength(
      MAX_INSTALLMENTS,
    );
  });

  it("throws below the minimum installment count", () => {
    expect(() => generateInstallmentPlan("X", "2026-01-01", 1)).toThrow(RangeError);
  });

  it("throws above the maximum installment count", () => {
    expect(() => generateInstallmentPlan("X", "2026-01-01", MAX_INSTALLMENTS + 1)).toThrow(
      RangeError,
    );
  });

  it("throws on a non-integer installment count", () => {
    expect(() => generateInstallmentPlan("X", "2026-01-01", 2.5)).toThrow(RangeError);
  });
});
