import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { BudgetLimitModal } from "../../../src/components/ui/BudgetLimitModal";
import { BudgetRow } from "../../../src/components/ui/BudgetRow";
import { MonthSummaryBar } from "../../../src/components/ui/MonthSummaryBar";
import {
  useBudgetOverview,
  useCopyBudgetsFromPreviousMonth,
  useDeleteBudget,
  useUpsertBudget,
} from "../../../src/features/budgets/queries";
import type { BudgetOverviewEntry } from "../../../src/features/budgets/overview";
import { useMonthSummary } from "../../../src/features/summary/queries";
import { currentYearMonth, isValidYearMonth, shiftYearMonth, yearMonthLabel } from "../../../src/lib/dates";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function BudgetScreen() {
  const { ym } = useLocalSearchParams<{ ym?: string }>();
  const yearMonth = isValidYearMonth(ym ?? "") ? (ym as string) : currentYearMonth();
  const profileId = useProfileStore((state) => state.activeProfileId);

  const [editingEntry, setEditingEntry] = useState<BudgetOverviewEntry | null>(null);

  const summaryQuery = useMonthSummary(profileId, yearMonth);
  const overviewQuery = useBudgetOverview(profileId, yearMonth);
  const upsertBudget = useUpsertBudget(profileId);
  const deleteBudget = useDeleteBudget(profileId);
  const copyFromPreviousMonth = useCopyBudgetsFromPreviousMonth(profileId);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14">
        <Pressable
          onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, -1) })}
          hitSlop={12}
        >
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-lg font-semibold capitalize">Orçamentos — {yearMonthLabel(yearMonth)}</Text>
        <Pressable
          onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, 1) })}
          hitSlop={12}
        >
          <Text className="text-2xl">→</Text>
        </Pressable>
      </View>

      {summaryQuery.data ? <MonthSummaryBar summary={summaryQuery.data} /> : null}

      <Pressable
        onPress={() => {
          copyFromPreviousMonth.mutate(yearMonth, {
            onSuccess: (copiedCount) => {
              Alert.alert(
                "Copiar orçamentos",
                copiedCount > 0
                  ? `${copiedCount} orçamento(s) copiado(s) do mês anterior.`
                  : "Nenhum orçamento novo para copiar do mês anterior.",
              );
            },
          });
        }}
        className="mx-4 my-3 items-center rounded-lg border border-blue-200 bg-blue-50 py-3"
      >
        <Text className="text-sm font-medium text-blue-700">
          Copiar orçamentos do mês anterior
        </Text>
      </Pressable>

      <FlatList
        data={overviewQuery.data ?? []}
        keyExtractor={(item) => item.categoryId}
        renderItem={({ item }) => <BudgetRow entry={item} onPress={() => setEditingEntry(item)} />}
        ListEmptyComponent={
          overviewQuery.isLoading ? null : (
            <View className="items-center px-6 py-16">
              <Text className="text-center text-gray-400">
                Nenhuma categoria disponível ainda.
              </Text>
            </View>
          )
        }
      />

      {editingEntry ? (
        <BudgetLimitModal
          visible={editingEntry !== null}
          categoryName={editingEntry.categoryName}
          initialLimitCents={editingEntry.limitCents}
          onSave={(limitCents) => {
            upsertBudget.mutate({ categoryId: editingEntry.categoryId, yearMonth, limitCents });
          }}
          onRemove={
            editingEntry.budgetId
              ? () => deleteBudget.mutate(editingEntry.budgetId!)
              : undefined
          }
          onClose={() => setEditingEntry(null)}
        />
      ) : null}
    </View>
  );
}
