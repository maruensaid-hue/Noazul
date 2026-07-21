import { router, useLocalSearchParams } from "expo-router";

import { ErrorState } from "../../../src/components/ui/ErrorState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { useCategories } from "../../../src/features/categories/queries";
import {
  useCreateRecurringSeries,
  useCreateTransaction,
} from "../../../src/features/transactions/queries";
import { TransactionForm } from "../../../src/features/transactions/TransactionForm";
import { currentYearMonth, isValidYearMonth, todayDateString } from "../../../src/lib/dates";
import { generateFixedRecurrencePlan, generateInstallmentPlan } from "../../../src/lib/recurrence";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function NewTransactionScreen() {
  const { ym } = useLocalSearchParams<{ ym?: string }>();
  const profileId = useProfileStore((state) => state.activeProfileId);
  const categoriesQuery = useCategories(profileId);
  const createTransaction = useCreateTransaction(profileId);
  const createSeries = useCreateRecurringSeries(profileId);

  const yearMonth = isValidYearMonth(ym ?? "") ? (ym as string) : currentYearMonth();
  const defaultDueDate = yearMonth === currentYearMonth() ? todayDateString() : `${yearMonth}-01`;

  if (categoriesQuery.isLoading) {
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

  return (
    <TransactionForm
      initialValues={{
        name: "",
        type: "EXPENSE",
        status: "PENDING",
        amountInput: "",
        dueDate: defaultDueDate,
        categoryId: null,
      }}
      categories={categoriesQuery.data}
      submitLabel="Adicionar lançamento"
      isSubmitting={createTransaction.isPending || createSeries.isPending}
      showRecurrenceOptions
      onSubmit={(input, recurrence) => {
        if (recurrence.mode === "single") {
          createTransaction.mutate(input, { onSuccess: () => router.back() });
          return;
        }

        const occurrences =
          recurrence.mode === "fixed"
            ? generateFixedRecurrencePlan(input.name, input.dueDate)
            : generateInstallmentPlan(input.name, input.dueDate, recurrence.installments);

        createSeries.mutate({ input, occurrences }, { onSuccess: () => router.back() });
      }}
    />
  );
}
