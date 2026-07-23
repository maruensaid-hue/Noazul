import { centsToBRL } from "../../lib/money";
import type { ReportRow } from "./types";

export interface ReportTotals {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
}

export function computeReportTotals(rows: readonly ReportRow[]): ReportTotals {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const row of rows) {
    if (row.type === "INCOME") incomeCents += row.amountCents;
    else expenseCents += row.amountCents;
  }
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface ReportHtmlOptions {
  periodLabel: string;
  filterSummaryLabel: string;
  generatedAtLabel: string;
}

/** Renders the filtered transactions as a printable HTML report — fed into expo-print's printToFileAsync. */
export function buildReportHtml(
  rows: readonly ReportRow[],
  totals: ReportTotals,
  options: ReportHtmlOptions,
): string {
  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.dueDate.split("-").reverse().join("/"))}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.categoryName)}</td>
          <td>${row.type === "INCOME" ? "Receita" : "Despesa"}</td>
          <td>${row.status === "PAID" ? "Pago" : "Pendente"}</td>
          <td class="amount ${row.type === "INCOME" ? "income" : "expense"}">${row.type === "INCOME" ? "+" : "-"}${escapeHtml(centsToBRL(row.amountCents))}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 24px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #6B7280; font-size: 12px; margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
  th { background: #F9FAFB; color: #6B7280; text-transform: uppercase; font-size: 10px; }
  td.amount { text-align: right; font-weight: 600; }
  td.amount.income { color: #16A34A; }
  td.amount.expense { color: #DC2626; }
  .totals { margin-top: 20px; font-size: 13px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; max-width: 280px; }
  .totals .balance { font-weight: 700; border-top: 1px solid #E5E7EB; margin-top: 6px; padding-top: 8px; }
</style>
</head>
<body>
  <h1>NoAzul — Relatório financeiro</h1>
  <div class="subtitle">${escapeHtml(options.periodLabel)}</div>
  <div class="subtitle">${escapeHtml(options.filterSummaryLabel)}</div>
  <div class="subtitle">Gerado em ${escapeHtml(options.generatedAtLabel)}</div>

  <table>
    <thead>
      <tr><th>Data</th><th>Nome</th><th>Categoria</th><th>Tipo</th><th>Status</th><th>Valor</th></tr>
    </thead>
    <tbody>
      ${tableRows || `<tr><td colspan="6">Nenhum lançamento no período/filtros selecionados.</td></tr>`}
    </tbody>
  </table>

  <div class="totals">
    <div><span>Receitas</span><span>${escapeHtml(centsToBRL(totals.incomeCents))}</span></div>
    <div><span>Despesas</span><span>${escapeHtml(centsToBRL(totals.expenseCents))}</span></div>
    <div class="balance"><span>Saldo</span><span>${escapeHtml(centsToBRL(totals.balanceCents))}</span></div>
  </div>
</body>
</html>`;
}
