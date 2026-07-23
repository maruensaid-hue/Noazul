export interface ReportFilters {
  /** "YYYY-MM-DD", inclusive. */
  from: string;
  /** "YYYY-MM-DD", inclusive. */
  to: string;
  type: "ALL" | "INCOME" | "EXPENSE";
  status: "ALL" | "PENDING" | "PAID";
  /** null = every category. */
  categoryId: string | null;
}

export interface ReportRow {
  id: string;
  name: string;
  categoryName: string;
  type: "INCOME" | "EXPENSE";
  status: "PENDING" | "PAID";
  amountCents: number;
  dueDate: string;
}
