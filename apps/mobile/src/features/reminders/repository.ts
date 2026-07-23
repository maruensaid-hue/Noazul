import { and, asc, eq, gte, isNull } from "drizzle-orm";

import { db } from "../../db/client";
import { appSettings, transactions } from "../../db/schema";
import { nowIso, todayDateString } from "../../lib/dates";

const SETTINGS_ID = "singleton";

export async function getPaymentRemindersEnabled(): Promise<boolean> {
  const [row] = await db
    .select({ enabled: appSettings.paymentRemindersEnabled })
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID));
  return row?.enabled ?? false;
}

export async function setPaymentRemindersEnabled(enabled: boolean): Promise<void> {
  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, paymentRemindersEnabled: enabled })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: { paymentRemindersEnabled: enabled, updatedAt: nowIso() },
    });
}

export interface UpcomingExpense {
  id: string;
  name: string;
  amountCents: number;
  dueDate: string;
}

/** Soonest-due PENDING expenses (today or later) for the active profile — the reminder scheduler's source list. */
export async function listUpcomingPendingExpenses(
  profileId: string,
  limit: number,
): Promise<UpcomingExpense[]> {
  return db
    .select({
      id: transactions.id,
      name: transactions.name,
      amountCents: transactions.amountCents,
      dueDate: transactions.dueDate,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.profileId, profileId),
        eq(transactions.type, "EXPENSE"),
        eq(transactions.status, "PENDING"),
        isNull(transactions.deletedAt),
        gte(transactions.dueDate, todayDateString()),
      ),
    )
    .orderBy(asc(transactions.dueDate))
    .limit(limit);
}
