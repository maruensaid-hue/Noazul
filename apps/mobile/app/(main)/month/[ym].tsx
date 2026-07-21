import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { ActionSheetModal } from "../../../src/components/ui/ActionSheetModal";
import { TransactionCard } from "../../../src/components/ui/TransactionCard";
import { useCategories } from "../../../src/features/categories/queries";
import { computeCategorySlices } from "../../../src/features/summary/derived";
import { MonthSummarySheet, SHEET_COLLAPSED_HEIGHT } from "../../../src/features/summary/MonthSummarySheet";
import { useMonthCategoryBreakdown, useMonthSummary } from "../../../src/features/summary/queries";
import {
  useDeleteTransaction,
  useDeleteTransactionSeries,
  useDuplicateTransaction,
  useMonthTransactions,
  useMoveTransaction,
  useToggleTransactionStatus,
} from "../../../src/features/transactions/queries";
import { confirmDeleteTransaction } from "../../../src/features/transactions/seriesActions";
import type { TransactionRow } from "../../../src/features/transactions/types";
import { isValidYearMonth, shiftYearMonth, yearMonthLabel } from "../../../src/lib/dates";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function MonthScreen() {
  const { ym } = useLocalSearchParams<{ ym: string }>();
  const yearMonth = isValidYearMonth(ym ?? "") ? (ym as string) : undefined;
  const profileId = useProfileStore((state) => state.activeProfileId);

  const [menuTransaction, setMenuTransaction] = useState<TransactionRow | null>(null);

  const transactionsQuery = useMonthTransactions(profileId, yearMonth ?? "");
  const summaryQuery = useMonthSummary(profileId, yearMonth ?? "");
  const categoryBreakdownQuery = useMonthCategoryBreakdown(profileId, yearMonth ?? "");
  const categoriesQuery = useCategories(profileId);

  const categorySlices = useMemo(
    () => computeCategorySlices(categoryBreakdownQuery.data ?? []),
    [categoryBreakdownQuery.data],
  );

  const toggleStatus = useToggleTransactionStatus(profileId);
  const duplicate = useDuplicateTransaction(profileId);
  const move = useMoveTransaction(profileId);
  const remove = useDeleteTransaction(profileId);
  const removeSeries = useDeleteTransactionSeries(profileId);

  const categoryById = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, { name: category.name, color: category.color });
    }
    return map;
  }, [categoriesQuery.data]);

  if (!yearMonth) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-red-600">Mês inválido: {String(ym)}</Text>
      </View>
    );
  }

  const menuOptions = menuTransaction
    ? [
        {
          label: menuTransaction.status === "PAID" ? "Marcar como pendente" : "Marcar como pago",
          onPress: () => toggleStatus.mutate(menuTransaction.id),
        },
        {
          label: "Duplicar lançamento",
          onPress: () => duplicate.mutate(menuTransaction.id),
        },
        {
          label: "Mover para o mês anterior",
          onPress: () => move.mutate({ id: menuTransaction.id, deltaMonths: -1 }),
        },
        {
          label: "Mover para o próximo mês",
          onPress: () => move.mutate({ id: menuTransaction.id, deltaMonths: 1 }),
        },
        {
          label: "Excluir",
          destructive: true,
          onPress: () =>
            confirmDeleteTransaction(menuTransaction, {
              onDeleteOnly: () => remove.mutate(menuTransaction.id),
              onDeleteSeries: () =>
                removeSeries.mutate({
                  recurrenceId: menuTransaction.recurrenceId!,
                  fromDueDate: menuTransaction.dueDate,
                }),
            }),
        },
      ]
    : [];

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14">
        <Pressable
          onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, -1) })}
          hitSlop={12}
        >
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-lg font-semibold capitalize">{yearMonthLabel(yearMonth)}</Text>
        <Pressable
          onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, 1) })}
          hitSlop={12}
        >
          <Text className="text-2xl">→</Text>
        </Pressable>
      </View>

      <Link href={`/(main)/budget?ym=${yearMonth}`} className="px-4 py-2 text-sm text-blue-600">
        Ver orçamentos do mês →
      </Link>

      <FlatList
        data={transactionsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: SHEET_COLLAPSED_HEIGHT + 16 }}
        renderItem={({ item }) => {
          const category = item.categoryId ? categoryById.get(item.categoryId) : undefined;
          return (
            <TransactionCard
              transaction={item}
              categoryName={category?.name}
              categoryColor={category?.color}
              onToggleStatus={(id) => toggleStatus.mutate(id)}
              onPress={(id) => router.push(`/transaction/${id}`)}
              onLongPress={() => setMenuTransaction(item)}
            />
          );
        }}
        ListEmptyComponent={
          transactionsQuery.isLoading ? null : (
            <View className="items-center px-6 py-16">
              <Text className="text-center text-gray-400">
                Nenhum lançamento em {yearMonthLabel(yearMonth)}. Toque em + para adicionar o
                primeiro.
              </Text>
            </View>
          )
        }
      />

      <Link
        href={`/transaction/new?ym=${yearMonth}`}
        className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-center text-2xl leading-[56px] text-white shadow-lg"
        style={{ bottom: SHEET_COLLAPSED_HEIGHT + 16 }}
      >
        +
      </Link>

      {summaryQuery.data ? (
        <MonthSummarySheet summary={summaryQuery.data} categorySlices={categorySlices} />
      ) : null}

      <ActionSheetModal
        visible={menuTransaction !== null}
        title={menuTransaction?.name}
        options={menuOptions}
        onClose={() => setMenuTransaction(null)}
      />
    </View>
  );
}
