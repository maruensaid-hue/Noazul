import { describe, expect, it } from "vitest";

import { buildReportHtml, computeReportTotals } from "./pdf";

const baseOptions = {
  periodLabel: "01/07/2026 a 31/07/2026",
  filterSummaryLabel: "Tipo: Todos · Status: Todos · Categoria: Todas",
  generatedAtLabel: "23/07/2026",
};

describe("computeReportTotals", () => {
  it("sums income and expense separately and computes the balance", () => {
    const totals = computeReportTotals([
      { id: "1", name: "Salário", categoryName: "—", type: "INCOME", status: "PAID", amountCents: 500000, dueDate: "2026-07-05" },
      { id: "2", name: "Aluguel", categoryName: "Moradia", type: "EXPENSE", status: "PAID", amountCents: 150000, dueDate: "2026-07-10" },
      { id: "3", name: "Mercado", categoryName: "Mercado", type: "EXPENSE", status: "PENDING", amountCents: 30000, dueDate: "2026-07-15" },
    ]);
    expect(totals).toEqual({ incomeCents: 500000, expenseCents: 180000, balanceCents: 320000 });
  });

  it("returns zeros for an empty list", () => {
    expect(computeReportTotals([])).toEqual({ incomeCents: 0, expenseCents: 0, balanceCents: 0 });
  });
});

describe("buildReportHtml", () => {
  it("includes every row's name and formatted amount", () => {
    const rows = [
      { id: "1", name: "Aluguel", categoryName: "Moradia", type: "EXPENSE" as const, status: "PAID" as const, amountCents: 150000, dueDate: "2026-07-10" },
    ];
    const html = buildReportHtml(rows, computeReportTotals(rows), baseOptions);
    expect(html).toContain("Aluguel");
    expect(html).toContain("Moradia");
    expect(html).toContain("10/07/2026");
  });

  it("shows an empty-state row when there are no transactions", () => {
    const html = buildReportHtml([], computeReportTotals([]), baseOptions);
    expect(html).toContain("Nenhum lançamento");
  });

  it("escapes HTML-significant characters in transaction names", () => {
    const rows = [
      { id: "1", name: "<script>alert(1)</script>", categoryName: "X", type: "EXPENSE" as const, status: "PENDING" as const, amountCents: 100, dueDate: "2026-07-01" },
    ];
    const html = buildReportHtml(rows, computeReportTotals(rows), baseOptions);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes the period and filter summary labels", () => {
    const html = buildReportHtml([], computeReportTotals([]), baseOptions);
    expect(html).toContain(baseOptions.periodLabel);
    expect(html).toContain(baseOptions.filterSummaryLabel);
  });
});
