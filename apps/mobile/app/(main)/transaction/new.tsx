import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useCategories } from "../../../src/features/categories/queries";
import { useCreateTransaction } from "../../../src/features/transactions/queries";
import { TransactionForm } from "../../../src/features/transactions/TransactionForm";
import { currentYearMonth, isValidYearMonth, todayDateString } from "../../../src/lib/dates";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function NewTransactionScreen() {
  const { ym } = useLocalSearchParams<{ ym?: string }>();
  const profileId = useProfileStore((state) => state.activeProfileId);
  const categoriesQuery = useCategories(profileId);
  const createTransaction = useCreateTransaction(profileId);

  const yearMonth = isValidYearMonth(ym ?? "") ? (ym as string) : currentYearMonth();
  const defaultDueDate = yearMonth === currentYearMonth() ? todayDateString() : `${yearMonth}-01`;

  if (categoriesQuery.isLoading || !categoriesQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
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
      isSubmitting={createTransaction.isPending}
      onSubmit={(input) => {
        createTransaction.mutate(input, {
          onSuccess: () => router.back(),
        });
      }}
    />
  );
}
