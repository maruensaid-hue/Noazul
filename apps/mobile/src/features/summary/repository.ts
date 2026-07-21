import { and, eq, isNull, like, sql } from "drizzle-orm";

import { db } from "../../db/client";
import { transactions } from "../../db/schema";
import { sumCents } from "../../lib/money";

export interface MonthSummary {
  /** Sum of all INCOME transactions this month. */
  incomeCents: number;
  /** Sum of all EXPENSE transactions this month, paid or pending. */
  expenseTotalCents: number;
  /** Sum of EXPENSE transactions already marked PAID. */
  expensePaidCents: number;
  /** Sum of EXPENSE transactions still PENDING — "falta pagar". */
  expensePendingCents: number;
  /** Income minus every committed expense (paid + pending) — "saldo seguro". */
  safeBalanceCents: number;
}

export async function getMonthSummary(
  profileId: string,
  yearMonth: string,
): Promise<MonthSummary> {
  const [row] = await db
    .select({
      incomeCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amountCents} else 0 end), 0)`,
      expenseTotalCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amountCents} else 0 end), 0)`,
      expensePaidCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' and ${transactions.status} = 'PAID' then ${transactions.amountCents} else 0 end), 0)`,
      expensePendingCents: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' and ${transactions.status} = 'PENDING' then ${transactions.amountCents} else 0 end), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.profileId, profileId),
        isNull(transactions.deletedAt),
        like(transactions.dueDate, `${yearMonth}-%`),
      ),
    );

  const incomeCents = row?.incomeCents ?? 0;
  const expenseTotalCents = row?.expenseTotalCents ?? 0;
  const expensePaidCents = row?.expensePaidCents ?? 0;
  const expensePendingCents = row?.expensePendingCents ?? 0;

  return {
    incomeCents,
    expenseTotalCents,
    expensePaidCents,
    expensePendingCents,
    safeBalanceCents: sumCents([incomeCents, -expenseTotalCents]),
  };
}
