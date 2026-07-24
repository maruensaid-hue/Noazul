import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { ActionSheetModal } from "../../../src/components/ui/ActionSheetModal";
import { AdBanner } from "../../../src/components/ui/AdBanner";
import { DonutChart } from "../../../src/components/ui/DonutChart";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { MotivationalBanner } from "../../../src/components/ui/MotivationalBanner";
import { StatChip } from "../../../src/components/ui/StatChip";
import { TransactionCard } from "../../../src/components/ui/TransactionCard";
import { useCategories } from "../../../src/features/categories/queries";
import { ProfileSwitcher } from "../../../src/features/profiles/ProfileSwitcher";
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
import { centsToBRL } from "../../../src/lib/money";
import { useBillingStore } from "../../../src/stores/billingStore";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function MonthScreen() {
  const { ym } = useLocalSearchParams<{ ym: string }>();
  const yearMonth = isValidYearMonth(ym ?? "") ? (ym as string) : undefined;
  const profileId = useProfileStore((state) => state.activeProfileId);
  const isPremium = useBillingStore((state) => state.isPremium);

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
    return <ErrorState message={`Mês inválido: ${String(ym)}`} />;
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

  const summary = summaryQuery.data;

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="gap-4 rounded-b-3xl bg-brand-600 pb-5 pt-14">
        <View className="flex-row items-center justify-between">
          <ProfileSwitcher variant="light" />
          <Link href="/(main)/settings" className="px-4 py-2 text-sm text-white/80">
            Ajustes
          </Link>
        </View>

        <View className="flex-row items-center justify-between px-4">
          <Pressable
            onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, -1) })}
            hitSlop={12}
          >
            <Text className="text-2xl text-white">←</Text>
          </Pressable>
          <Text className="text-lg font-semibold capitalize text-white">
            {yearMonthLabel(yearMonth)}
          </Text>
          <Pressable
            onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, 1) })}
            hitSlop={12}
          >
            <Text className="text-2xl text-white">→</Text>
          </Pressable>
        </View>

        {summary ? (
          <View className="flex-row items-center justify-between px-5">
            <View className="flex-1 gap-1 pr-3">
              <Text className="text-sm text-white/70">Saldo seguro</Text>
              <Text
                className="text-4xl font-extrabold text-white"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {centsToBRL(summary.safeBalanceCents)}
              </Text>
            </View>
            <DonutChart
              slices={categorySlices}
              size={92}
              strokeWidth={14}
              trackColor="rgba(255,255,255,0.15)"
            />
          </View>
        ) : null}

        {summary ? (
          <View className="flex-row gap-2 px-4">
            <StatChip label="Receita" cents={summary.incomeCents} tone="success" />
            <StatChip label="Despesas" cents={summary.expenseTotalCents} tone="danger" />
            <StatChip label="A pagar" cents={summary.expensePendingCents} tone="warning" />
          </View>
        ) : null}
      </View>

      {summary ? <MotivationalBanner safeBalanceCents={summary.safeBalanceCents} /> : null}

      <View className="flex-row items-center justify-between px-4 py-2">
        <Link href={`/(main)/budget?ym=${yearMonth}`} className="text-sm font-medium text-brand-600">
          Ver orçamentos do mês →
        </Link>
        <Link href={`/(main)/year/${yearMonth.slice(0, 4)}`} className="text-sm font-medium text-brand-600">
          Ver resumo anual →
        </Link>
      </View>

      {transactionsQuery.isLoading ? (
        <LoadingState />
      ) : transactionsQuery.isError ? (
        <ErrorState
          message="Não foi possível carregar os lançamentos."
          onRetry={() => transactionsQuery.refetch()}
        />
      ) : (
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
            <EmptyState
              message={`Nenhum lançamento em ${yearMonthLabel(yearMonth)}. Toque em + para adicionar o primeiro.`}
            />
          }
          ListFooterComponent={!isPremium ? <AdBanner /> : null}
        />
      )}

      <Link
        href={`/transaction/new?ym=${yearMonth}`}
        className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-center text-2xl leading-[56px] text-white shadow-lg"
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
