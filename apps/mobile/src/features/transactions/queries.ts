import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RecurrenceOccurrence } from "../../lib/recurrence";
import {
  createRecurringSeries,
  createTransaction,
  deleteTransaction,
  deleteTransactionSeriesFromDate,
  duplicateTransaction,
  getTransaction,
  listTransactionsForMonth,
  moveTransactionByMonths,
  toggleTransactionStatus,
  updateTransaction,
  updateTransactionSeriesFromDate,
} from "./repository";
import type { TransactionInput } from "./types";

export const transactionKeys = {
  monthRoot: (profileId: string) => ["transactions", profileId] as const,
  month: (profileId: string, yearMonth: string) =>
    ["transactions", profileId, yearMonth] as const,
  summaryRoot: (profileId: string) => ["transactions-summary", profileId] as const,
  detail: (id: string) => ["transaction", id] as const,
};

export function useMonthTransactions(profileId: string | null, yearMonth: string) {
  return useQuery({
    queryKey: transactionKeys.month(profileId ?? "", yearMonth),
    queryFn: () => listTransactionsForMonth(profileId as string, yearMonth),
    enabled: profileId !== null,
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.detail(id ?? ""),
    queryFn: () => getTransaction(id as string),
    enabled: id !== undefined,
  });
}

/**
 * Every mutation invalidates the whole month-list/summary tree for the profile
 * (not just the affected month) so operations that touch two months, like
 * moving a transaction, always leave both views correct.
 */
function useInvalidateTransactions(profileId: string | null) {
  const queryClient = useQueryClient();
  return () => {
    if (!profileId) return;
    void queryClient.invalidateQueries({ queryKey: transactionKeys.monthRoot(profileId) });
    void queryClient.invalidateQueries({ queryKey: transactionKeys.summaryRoot(profileId) });
  };
}

export function useCreateTransaction(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(profileId as string, input),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      updateTransaction(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: invalidate,
  });
}

export function useToggleTransactionStatus(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: (id: string) => toggleTransactionStatus(id),
    onSuccess: invalidate,
  });
}

export function useDuplicateTransaction(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: (id: string) => duplicateTransaction(id),
    onSuccess: invalidate,
  });
}

export function useMoveTransaction(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: ({ id, deltaMonths }: { id: string; deltaMonths: number }) =>
      moveTransactionByMonths(id, deltaMonths),
    onSuccess: invalidate,
  });
}

export function useCreateRecurringSeries(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: ({
      input,
      occurrences,
    }: {
      input: TransactionInput;
      occurrences: readonly RecurrenceOccurrence[];
    }) => createRecurringSeries(profileId as string, input, occurrences),
    onSuccess: invalidate,
  });
}

export function useUpdateTransactionSeries(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: ({
      recurrenceId,
      excludeId,
      fromDueDate,
      input,
    }: {
      recurrenceId: string;
      excludeId: string;
      fromDueDate: string;
      input: Pick<TransactionInput, "name" | "type" | "amountCents" | "categoryId">;
    }) => updateTransactionSeriesFromDate(recurrenceId, excludeId, fromDueDate, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransactionSeries(profileId: string | null) {
  const invalidate = useInvalidateTransactions(profileId);
  return useMutation({
    mutationFn: ({ recurrenceId, fromDueDate }: { recurrenceId: string; fromDueDate: string }) =>
      deleteTransactionSeriesFromDate(recurrenceId, fromDueDate),
    onSuccess: invalidate,
  });
}
