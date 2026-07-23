import { and, asc, eq, gte, isNull, lte } from "drizzle-orm";

import { db } from "../../db/client";
import { categories, transactions } from "../../db/schema";
import type { ReportFilters, ReportRow } from "./types";

export async function listReportTransactions(
  profileId: string,
  filters: ReportFilters,
): Promise<ReportRow[]> {
  const conditions = [
    eq(transactions.profileId, profileId),
    isNull(transactions.deletedAt),
    gte(transactions.dueDate, filters.from),
    lte(transactions.dueDate, filters.to),
  ];
  if (filters.type !== "ALL") conditions.push(eq(transactions.type, filters.type));
  if (filters.status !== "ALL") conditions.push(eq(transactions.status, filters.status));
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));

  const rows = await db
    .select({
      id: transactions.id,
      name: transactions.name,
      categoryName: categories.name,
      type: transactions.type,
      status: transactions.status,
      amountCents: transactions.amountCents,
      dueDate: transactions.dueDate,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(asc(transactions.dueDate));

  return rows.map((row) => ({ ...row, categoryName: row.categoryName ?? "Sem categoria" }));
}
