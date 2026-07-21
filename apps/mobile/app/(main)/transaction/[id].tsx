import { router, useLocalSearchParams } from "expo-router";

import { EmptyState } from "../../../src/components/ui/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { useCategories } from "../../../src/features/categories/queries";
import {
  useDeleteTransaction,
  useDeleteTransactionSeries,
  useTransaction,
  useUpdateTransaction,
  useUpdateTransactionSeries,
} from "../../../src/features/transactions/queries";
import { confirmDeleteTransaction, confirmEditScope } from "../../../src/features/transactions/seriesActions";
import { TransactionForm } from "../../../src/features/transactions/TransactionForm";
import type { TransactionInput } from "../../../src/features/transactions/types";
import { centsToInputString } from "../../../src/lib/money";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = useProfileStore((state) => state.activeProfileId);
  const transactionQuery = useTransaction(id);
  const categoriesQuery = useCategories(profileId);
  const updateTransaction = useUpdateTransaction(profileId);
  const updateSeries = useUpdateTransactionSeries(profileId);
  const deleteTransaction = useDeleteTransaction(profileId);
  const deleteSeries = useDeleteTransactionSeries(profileId);

  if (transactionQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingState />;
  }
  if (categoriesQuery.isError || !categoriesQuery.data) {
    return (
      <ErrorState
        message="Não foi possível carregar as categorias."
        onRetry={() => categoriesQuery.refetch()}
      />
    );
  }
  if (transactionQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar o lançamento."
        onRetry={() => transactionQuery.refetch()}
      />
    );
  }

  const transaction = transactionQuery.data;
  if (!transaction) {
    return <EmptyState message="Lançamento não encontrado." />;
  }

  function saveOnlyThis(input: TransactionInput) {
    updateTransaction.mutate({ id: transaction!.id, input }, { onSuccess: () => router.back() });
  }

  function saveThisAndFuture(input: TransactionInput) {
    updateTransaction.mutate({ id: transaction!.id, input });
    updateSeries.mutate(
      {
        recurrenceId: transaction!.recurrenceId!,
        excludeId: transaction!.id,
        fromDueDate: transaction!.dueDate,
        input: { name: input.name, type: input.type, amountCents: input.amountCents, categoryId: input.categoryId },
      },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <TransactionForm
      initialValues={{
        name: transaction.name,
        type: transaction.type,
        status: transaction.status,
        amountInput: centsToInputString(transaction.amountCents),
        dueDate: transaction.dueDate,
        categoryId: transaction.categoryId,
      }}
      categories={categoriesQuery.data}
      submitLabel="Salvar alterações"
      isSubmitting={updateTransaction.isPending || updateSeries.isPending}
      onSubmit={(input) => {
        confirmEditScope(transaction, {
          onOnlyThis: () => saveOnlyThis(input),
          onThisAndFuture: () => saveThisAndFuture(input),
        });
      }}
      onDelete={() => {
        confirmDeleteTransaction(transaction, {
          onDeleteOnly: () => {
            deleteTransaction.mutate(transaction.id, { onSuccess: () => router.back() });
          },
          onDeleteSeries: () => {
            deleteSeries.mutate(
              { recurrenceId: transaction.recurrenceId!, fromDueDate: transaction.dueDate },
              { onSuccess: () => router.back() },
            );
          },
        });
      }}
    />
  );
}
