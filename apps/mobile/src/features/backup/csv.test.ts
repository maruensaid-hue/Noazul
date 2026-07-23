import { describe, expect, it } from "vitest";

import { transactionsToCsv } from "./csv";

describe("transactionsToCsv", () => {
  it("writes the header row even with no transactions", () => {
    expect(transactionsToCsv([])).toBe("Nome,Categoria,Tipo,Status,Valor,Vencimento,Parcela");
  });

  it("formats a plain transaction row", () => {
    const csv = transactionsToCsv([
      {
        name: "Aluguel",
        categoryName: "Moradia",
        type: "EXPENSE",
        status: "PAID",
        amountCents: 150000,
        dueDate: "2026-07-10",
        installmentNo: null,
        installmentOf: null,
      },
    ]);
    expect(csv).toBe(
      "Nome,Categoria,Tipo,Status,Valor,Vencimento,Parcela\nAluguel,Moradia,Despesa,Pago,1500.00,2026-07-10,",
    );
  });

  it("formats an installment transaction's parcela column", () => {
    const csv = transactionsToCsv([
      {
        name: "Notebook (3/10)",
        categoryName: "Tecnologia",
        type: "EXPENSE",
        status: "PENDING",
        amountCents: 20000,
        dueDate: "2026-05-10",
        installmentNo: 3,
        installmentOf: 10,
      },
    ]);
    expect(csv).toContain("3/10");
  });

  it("formats income as Receita", () => {
    const csv = transactionsToCsv([
      {
        name: "Salário",
        categoryName: "Sem categoria",
        type: "INCOME",
        status: "PAID",
        amountCents: 500000,
        dueDate: "2026-07-05",
        installmentNo: null,
        installmentOf: null,
      },
    ]);
    expect(csv).toContain("Receita");
  });

  it("quotes a field containing a comma", () => {
    const csv = transactionsToCsv([
      {
        name: "Presente, aniversário",
        categoryName: "Lazer",
        type: "EXPENSE",
        status: "PENDING",
        amountCents: 5000,
        dueDate: "2026-07-01",
        installmentNo: null,
        installmentOf: null,
      },
    ]);
    expect(csv).toContain('"Presente, aniversário"');
  });

  it("escapes an embedded double quote", () => {
    const csv = transactionsToCsv([
      {
        name: 'Curso "Excel avançado"',
        categoryName: "Educação",
        type: "EXPENSE",
        status: "PENDING",
        amountCents: 10000,
        dueDate: "2026-07-01",
        installmentNo: null,
        installmentOf: null,
      },
    ]);
    expect(csv).toContain('"Curso ""Excel avançado"""');
  });
});
