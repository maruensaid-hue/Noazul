import { and, asc, eq, gte, isNull, like, ne } from "drizzle-orm";

import { db } from "../../db/client";
import { transactions } from "../../db/schema";
import { nowIso, shiftDateByMonths } from "../../lib/dates";
import { newId } from "../../lib/id";
import type { RecurrenceOccurrence } from "../../lib/recurrence";
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

/**
 * Materializes a recurring series (fixed monthly or installments, see
 * lib/recurrence.ts) as one row per occurrence sharing a fresh recurrenceId.
 * Only the first occurrence inherits `input.status` — future occurrences
 * always start PENDING, since a bill due next year can't already be paid.
 */
export async function createRecurringSeries(
  profileId: string,
  input: TransactionInput,
  occurrences: readonly RecurrenceOccurrence[],
): Promise<string> {
  const recurrenceId = newId();
  await db.transaction(async (tx) => {
    for (const [index, occurrence] of occurrences.entries()) {
      const status = index === 0 ? input.status : "PENDING";
      await tx.insert(transactions).values({
        id: newId(),
        profileId,
        categoryId: input.categoryId,
        name: occurrence.name,
        type: input.type,
        status,
        amountCents: input.amountCents,
        dueDate: occurrence.dueDate,
        paidAt: status === "PAID" ? nowIso() : null,
        recurrenceId,
        installmentNo: occurrence.installmentNo,
        installmentOf: occurrence.installmentOf,
      });
    }
  });
  return recurrenceId;
}

/**
 * "Esta e futuras": propagates name/type/amount/category to every other
 * occurrence in the series due on or after `fromDueDate`. Deliberately
 * excludes `status`/`paidAt`/`dueDate` — a future occurrence being edited
 * today must not be marked paid, and past occurrences are never touched
 * because of the `gte(dueDate, fromDueDate)` filter.
 */
export async function updateTransactionSeriesFromDate(
  recurrenceId: string,
  excludeId: string,
  fromDueDate: string,
  input: Pick<TransactionInput, "name" | "type" | "amountCents" | "categoryId">,
): Promise<void> {
  await db
    .update(transactions)
    .set({
      name: input.name,
      type: input.type,
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      updatedAt: nowIso(),
    })
    .where(
      and(
        eq(transactions.recurrenceId, recurrenceId),
        ne(transactions.id, excludeId),
        gte(transactions.dueDate, fromDueDate),
        isNull(transactions.deletedAt),
      ),
    );
}

/** "Esta e futuras" (excluir): soft-deletes this occurrence and every later one in the series. */
export async function deleteTransactionSeriesFromDate(
  recurrenceId: string,
  fromDueDate: string,
): Promise<void> {
  await db
    .update(transactions)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(
      and(
        eq(transactions.recurrenceId, recurrenceId),
        gte(transactions.dueDate, fromDueDate),
        isNull(transactions.deletedAt),
      ),
    );
}
