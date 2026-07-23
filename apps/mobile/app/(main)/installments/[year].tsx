import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { EmptyState } from "../../../src/components/ui/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { InstallmentCard } from "../../../src/components/ui/InstallmentCard";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { useInstallmentSchedule } from "../../../src/features/installments/queries";
import { isValidYear } from "../../../src/lib/dates";
import { centsToBRL } from "../../../src/lib/money";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function InstallmentsScreen() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const yearValue = isValidYear(year ?? "") ? Number(year) : undefined;
  const profileId = useProfileStore((state) => state.activeProfileId);

  const scheduleQuery = useInstallmentSchedule(profileId, yearValue ?? 0);

  if (!yearValue) {
    return <ErrorState message={`Ano inválido: ${String(year)}`} />;
  }

  const totalCentsThisYear = (scheduleQuery.data ?? []).reduce(
    (sum, entry) => sum + entry.monthlyAmountsCents.reduce((a, b) => a + b, 0),
    0,
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
        <Pressable onPress={() => router.setParams({ year: String(yearValue - 1) })} hitSlop={12}>
          <Text className="text-2xl text-gray-900 dark:text-gray-50">←</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Compras parceladas — {yearValue}
        </Text>
        <Pressable onPress={() => router.setParams({ year: String(yearValue + 1) })} hitSlop={12}>
          <Text className="text-2xl text-gray-900 dark:text-gray-50">→</Text>
        </Pressable>
      </View>

      {scheduleQuery.isLoading ? (
        <LoadingState />
      ) : scheduleQuery.isError ? (
        <ErrorState
          message="Não foi possível carregar as compras parceladas."
          onRetry={() => scheduleQuery.refetch()}
        />
      ) : (
        <FlatList
          data={scheduleQuery.data ?? []}
          keyExtractor={(item) => item.recurrenceId}
          renderItem={({ item }) => <InstallmentCard year={yearValue} entry={item} />}
          ListHeaderComponent={
            (scheduleQuery.data ?? []).length > 0 ? (
              <View className="flex-row items-center justify-between bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                <Text className="text-sm text-gray-500 dark:text-gray-400">Total parcelado em {yearValue}</Text>
                <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {centsToBRL(totalCentsThisYear)}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState message='Nenhuma compra parcelada neste ano. Crie um lançamento e marque como "Parcelada" para vê-lo aqui.' />
          }
        />
      )}
    </View>
  );
}
