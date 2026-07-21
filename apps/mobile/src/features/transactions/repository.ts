import { and, asc, eq, isNull, like } from "drizzle-orm";

import { db } from "../../db/client";
import { transactions } from "../../db/schema";
import { nowIso, shiftDateByMonths } from "../../lib/dates";
import { newId } from "../../lib/id";
import type { TransactionInput, TransactionRow } from "./types";

function monthPrefix(yearMonth: string): string {
  return `${yearMonth}-%`;
}

export async function listTransactionsForMonth(
  profileId: string,
  yearMonth: string,
): Promise<TransactionRow[]> {
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.profileId, profileId),
        isNull(transactions.deletedAt),
        like(transactions.dueDate, monthPrefix(yearMonth)),
      ),
    )
    .orderBy(asc(transactions.dueDate), asc(transactions.name));
}

export async function getTransaction(id: string): Promise<TransactionRow | undefined> {
  const [row] = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return row;
}

export async function createTransaction(
  profileId: string,
  input: TransactionInput,
): Promise<string> {
  const id = newId();
  await db.insert(transactions).values({
    id,
    profileId,
    categoryId: input.categoryId,
    name: input.name,
    type: input.type,
    status: input.status,
    amountCents: input.amountCents,
    dueDate: input.dueDate,
    paidAt: input.status === "PAID" ? nowIso() : null,
  });
  return id;
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<void> {
  await db
    .update(transactions)
    .set({
      categoryId: input.categoryId,
      name: input.name,
      type: input.type,
      status: input.status,
      amountCents: input.amountCents,
      dueDate: input.dueDate,
      paidAt: input.status === "PAID" ? nowIso() : null,
      updatedAt: nowIso(),
    })
    .where(eq(transactions.id, id));
}

/** Soft delete: keeps the row (with `deletedAt` set) so a future sync can propagate the tombstone. */
export async function deleteTransaction(id: string): Promise<void> {
  await db
    .update(transactions)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(transactions.id, id));
}

export async function toggleTransactionStatus(id: string): Promise<void> {
  const row = await getTransaction(id);
  if (!row) return;

  const nextStatus = row.status === "PAID" ? "PENDING" : "PAID";
  await db
    .update(transactions)
    .set({
      status: nextStatus,
      paidAt: nextStatus === "PAID" ? nowIso() : null,
      updatedAt: nowIso(),
    })
    .where(eq(transactions.id, id));
}

export async function duplicateTransaction(id: string): Promise<string | undefined> {
  const row = await getTransaction(id);
  if (!row) return undefined;

  const newTransactionId = newId();
  await db.insert(transactions).values({
    id: newTransactionId,
    profileId: row.profileId,
    categoryId: row.categoryId,
    name: row.name,
    type: row.type,
    status: "PENDING",
    amountCents: row.amountCents,
    dueDate: row.dueDate,
    paidAt: null,
  });
  return newTransactionId;
}

/** Moves a transaction to the previous (-1) or next (+1) month, clamping the day. */
export async function moveTransactionByMonths(id: string, deltaMonths: number): Promise<void> {
  const row = await getTransaction(id);
  if (!row) return;

  await db
    .update(transactions)
    .set({ dueDate: shiftDateByMonths(row.dueDate, deltaMonths), updatedAt: nowIso() })
    .where(eq(transactions.id, id));
}
