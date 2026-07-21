import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { useCategories } from "../../../src/features/categories/queries";
import {
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from "../../../src/features/transactions/queries";
import { TransactionForm } from "../../../src/features/transactions/TransactionForm";
import { centsToInputString } from "../../../src/lib/money";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = useProfileStore((state) => state.activeProfileId);
  const transactionQuery = useTransaction(id);
  const categoriesQuery = useCategories(profileId);
  const updateTransaction = useUpdateTransaction(profileId);
  const deleteTransaction = useDeleteTransaction(profileId);

  if (transactionQuery.isLoading || categoriesQuery.isLoading || !categoriesQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const transaction = transactionQuery.data;
  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-gray-500">Lançamento não encontrado.</Text>
      </View>
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
      isSubmitting={updateTransaction.isPending}
      onSubmit={(input) => {
        updateTransaction.mutate(
          { id: transaction.id, input },
          { onSuccess: () => router.back() },
        );
      }}
      onDelete={() => {
        deleteTransaction.mutate(transaction.id, {
          onSuccess: () => router.back(),
        });
      }}
    />
  );
}
