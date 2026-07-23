export interface TransactionCsvRow {
  name: string;
  categoryName: string;
  type: "INCOME" | "EXPENSE";
  status: "PENDING" | "PAID";
  amountCents: number;
  dueDate: string;
  installmentNo: number | null;
  installmentOf: number | null;
}

const CSV_HEADER = ["Nome", "Categoria", "Tipo", "Status", "Valor", "Vencimento", "Parcela"];

/** Quotes a field only when it contains a character that would otherwise break CSV parsing. */
function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Builds a CSV string of transactions, one row per lançamento. `Valor` is
 * plain "1234.56" (dot decimal) so it stays numeric/summable when opened in
 * Excel/Sheets, regardless of the app's locale.
 */
export function transactionsToCsv(rows: readonly TransactionCsvRow[]): string {
  const lines = [CSV_HEADER.join(",")];
  for (const row of rows) {
    const fields = [
      row.name,
      row.categoryName,
      row.type === "INCOME" ? "Receita" : "Despesa",
      row.status === "PAID" ? "Pago" : "Pendente",
      (row.amountCents / 100).toFixed(2),
      row.dueDate,
      row.installmentOf ? `${row.installmentNo}/${row.installmentOf}` : "",
    ];
    lines.push(fields.map(escapeCsvField).join(","));
  }
  return lines.join("\n");
}
