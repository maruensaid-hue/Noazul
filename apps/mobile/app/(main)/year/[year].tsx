import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { DonutChart } from "../../../src/components/ui/DonutChart";
import { DonutChartLegend } from "../../../src/components/ui/DonutChartLegend";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { YearBarChart } from "../../../src/components/ui/YearBarChart";
import { computeCategorySlices } from "../../../src/features/summary/derived";
import { useYearCategoryBreakdown, useYearSummary } from "../../../src/features/summary/queries";
import { isValidYear } from "../../../src/lib/dates";
import { centsToBRL } from "../../../src/lib/money";
import { colors } from "../../../src/lib/theme";
import { useProfileStore } from "../../../src/stores/profileStore";

function YearTotalLine({ label, cents, color }: { label: string; cents: number; color?: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-gray-500 dark:text-gray-400">{label}</Text>
      <Text
        className={color ? "font-semibold" : "font-medium text-gray-700 dark:text-gray-300"}
        style={color ? { color } : undefined}
      >
        {centsToBRL(cents)}
      </Text>
    </View>
  );
}

export default function YearScreen() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const yearValue = isValidYear(year ?? "") ? Number(year) : undefined;
  const profileId = useProfileStore((state) => state.activeProfileId);

  const summaryQuery = useYearSummary(profileId, yearValue ?? 0);
  const categoryBreakdownQuery = useYearCategoryBreakdown(profileId, yearValue ?? 0);

  const categorySlices = useMemo(
    () => computeCategorySlices(categoryBreakdownQuery.data ?? []),
    [categoryBreakdownQuery.data],
  );

  if (!yearValue) {
    return <ErrorState message={`Ano inválido: ${String(year)}`} />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
        <Pressable onPress={() => router.setParams({ year: String(yearValue - 1) })} hitSlop={12}>
          <Text className="text-2xl text-gray-900 dark:text-gray-50">←</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Resumo anual — {yearValue}
        </Text>
        <Pressable onPress={() => router.setParams({ year: String(yearValue + 1) })} hitSlop={12}>
          <Text className="text-2xl text-gray-900 dark:text-gray-50">→</Text>
        </Pressable>
      </View>

      {summaryQuery.isLoading ? (
        <LoadingState />
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <ErrorState
          message="Não foi possível carregar o resumo anual."
          onRetry={() => summaryQuery.refetch()}
        />
      ) : (
        <ScrollView contentContainerClassName="gap-5 px-4 py-4">
          <View className="gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
            <YearTotalLine label="Receitas do ano" cents={summaryQuery.data.totalIncomeCents} color={colors.success} />
            <YearTotalLine label="Despesas do ano" cents={summaryQuery.data.totalExpenseCents} color={colors.danger} />
            <View className="mt-1 border-t border-gray-200 pt-2 dark:border-gray-700">
              <YearTotalLine
                label="Saldo do ano"
                cents={summaryQuery.data.totalBalanceCents}
                color={summaryQuery.data.totalBalanceCents < 0 ? colors.danger : colors.success}
              />
            </View>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Mês a mês</Text>
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.success }} />
                  <Text className="text-xs text-gray-400 dark:text-gray-500">Receita</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.danger }} />
                  <Text className="text-xs text-gray-400 dark:text-gray-500">Despesa</Text>
                </View>
              </View>
            </View>
            <YearBarChart months={summaryQuery.data.months} />
          </View>

          <View className="items-center gap-4">
            <Text className="self-start text-sm font-medium text-gray-600 dark:text-gray-300">
              Gasto por categoria no ano
            </Text>
            <DonutChart slices={categorySlices} />
            {categorySlices.length > 0 ? (
              <DonutChartLegend slices={categorySlices} />
            ) : (
              <Text className="text-sm text-gray-400 dark:text-gray-500">
                Nenhuma despesa neste ano ainda.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
