import { describe, expect, it } from "vitest";

import { buildInstallmentSchedule, stripInstallmentSuffix } from "./schedule";

describe("stripInstallmentSuffix", () => {
  it("removes the trailing (n/N) suffix", () => {
    expect(stripInstallmentSuffix("Notebook (3/10)")).toBe("Notebook");
  });

  it("leaves a name without a suffix untouched", () => {
    expect(stripInstallmentSuffix("Notebook")).toBe("Notebook");
  });

  it("only strips a suffix at the end of the string", () => {
    expect(stripInstallmentSuffix("Plano (2/6) família")).toBe("Plano (2/6) família");
  });
});

describe("buildInstallmentSchedule", () => {
  const series = [
    {
      recurrenceId: "r1",
      name: "Notebook (1/10)",
      categoryId: "cat-a",
      categoryName: "Tecnologia",
      categoryColor: "#111",
      installmentOf: 10,
      installmentValueCents: 20000,
      firstDueDate: "2026-03-10",
    },
  ];

  it("spreads a series' monthly amounts across the requested year", () => {
    const totals = [{ recurrenceId: "r1", totalValueCents: 200000 }];
    const monthly = [
      { recurrenceId: "r1", yearMonth: "2026-03", amountCents: 20000 },
      { recurrenceId: "r1", yearMonth: "2026-04", amountCents: 20000 },
    ];
    const result = buildInstallmentSchedule(2026, series, totals, monthly);

    expect(result).toHaveLength(1);
    expect(result[0]?.baseName).toBe("Notebook");
    expect(result[0]?.totalValueCents).toBe(200000);
    expect(result[0]?.monthlyAmountsCents).toEqual([
      0, 0, 20000, 20000, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it("drops a series with nothing due in the requested year", () => {
    const totals = [{ recurrenceId: "r1", totalValueCents: 200000 }];
    const monthly = [{ recurrenceId: "r1", yearMonth: "2027-01", amountCents: 20000 }];
    expect(buildInstallmentSchedule(2026, series, totals, monthly)).toEqual([]);
  });

  it("falls back to installmentValueCents * installmentOf when a total row is missing", () => {
    const monthly = [{ recurrenceId: "r1", yearMonth: "2026-03", amountCents: 20000 }];
    const result = buildInstallmentSchedule(2026, series, [], monthly);
    expect(result[0]?.totalValueCents).toBe(200000);
  });

  it("sums multiple monthly rows for the same series/month", () => {
    const monthly = [
      { recurrenceId: "r1", yearMonth: "2026-03", amountCents: 10000 },
      { recurrenceId: "r1", yearMonth: "2026-03", amountCents: 10000 },
    ];
    const result = buildInstallmentSchedule(2026, series, [], monthly);
    expect(result[0]?.monthlyAmountsCents[2]).toBe(20000);
  });
});
