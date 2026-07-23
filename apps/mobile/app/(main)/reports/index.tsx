import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { EmptyState } from "../../../src/components/ui/EmptyState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { SegmentedControl } from "../../../src/components/ui/SegmentedControl";
import { useCategories } from "../../../src/features/categories/queries";
import { computeReportTotals } from "../../../src/features/reports/pdf";
import { useGenerateReportPdf, useReportTransactions } from "../../../src/features/reports/queries";
import type { ReportFilters } from "../../../src/features/reports/types";
import { currentYearMonth, daysInMonth, parseYearMonth } from "../../../src/lib/dates";
import { centsToBRL } from "../../../src/lib/money";
import { colors } from "../../../src/lib/theme";
import { useBillingStore } from "../../../src/stores/billingStore";
import { useProfileStore } from "../../../src/stores/profileStore";

type PeriodPreset = "month" | "year" | "all";

const PERIOD_OPTIONS = [
  { value: "month" as const, label: "Este mês" },
  { value: "year" as const, label: "Este ano" },
  { value: "all" as const, label: "Tudo" },
];

const TYPE_OPTIONS = [
  { value: "ALL" as const, label: "Todos" },
  { value: "INCOME" as const, label: "Receitas" },
  { value: "EXPENSE" as const, label: "Despesas" },
];

const STATUS_OPTIONS = [
  { value: "ALL" as const, label: "Todos" },
  { value: "PAID" as const, label: "Pago" },
  { value: "PENDING" as const, label: "Pendente" },
];

function periodRange(preset: PeriodPreset): { from: string; to: string; label: string } {
  const yearMonth = currentYearMonth();
  const { year, month } = parseYearMonth(yearMonth);
  if (preset === "month") {
    const lastDay = String(daysInMonth({ year, month })).padStart(2, "0");
    return { from: `${yearMonth}-01`, to: `${yearMonth}-${lastDay}`, label: `Mês atual (${yearMonth})` };
  }
  if (preset === "year") {
    return { from: `${year}-01-01`, to: `${year}-12-31`, label: `Ano atual (${year})` };
  }
  return { from: "0001-01-01", to: "9999-12-31", label: "Todo o histórico" };
}

export default function ReportsScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);
  const profileId = useProfileStore((state) => state.activeProfileId);

  const [period, setPeriod] = useState<PeriodPreset>("month");
  const [type, setType] = useState<ReportFilters["type"]>("ALL");
  const [status, setStatus] = useState<ReportFilters["status"]>("ALL");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const categoriesQuery = useCategories(profileId);
  const range = useMemo(() => periodRange(period), [period]);
  const filters: ReportFilters = useMemo(
    () => ({ from: range.from, to: range.to, type, status, categoryId }),
    [range, type, status, categoryId],
  );

  const reportQuery = useReportTransactions(profileId, filters);
  const generatePdf = useGenerateReportPdf();

  const totals = useMemo(() => computeReportTotals(reportQuery.data ?? []), [reportQuery.data]);
  const selectedCategoryName = categoriesQuery.data?.find((category) => category.id === categoryId)?.name;

  if (!isPremium) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <Header />
        <View className="items-center gap-4 px-6 py-16">
          <Text className="text-center text-gray-500 dark:text-gray-400">
            Relatórios em PDF com filtros avançados é um recurso Premium.
          </Text>
          <Pressable onPress={() => router.push("/paywall")} className="rounded-lg bg-brand-600 px-5 py-3">
            <Text className="font-medium text-white">Conhecer o Premium</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function filterSummaryLabel(): string {
    const typeLabel = TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Todos";
    const statusLabel = STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "Todos";
    const categoryLabel = selectedCategoryName ?? "Todas";
    return `Tipo: ${typeLabel} · Status: ${statusLabel} · Categoria: ${categoryLabel}`;
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <Header />
      <ScrollView contentContainerClassName="gap-5 px-4 py-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Período</Text>
          <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Tipo</Text>
          <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</Text>
          <SegmentedControl options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            <CategoryChip label="Todas" selected={categoryId === null} onPress={() => setCategoryId(null)} />
            {(categoriesQuery.data ?? []).map((category) => (
              <CategoryChip
                key={category.id}
                label={category.name}
                selected={categoryId === category.id}
                onPress={() => setCategoryId(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {reportQuery.isLoading ? (
          <LoadingState />
        ) : (
          <View className="gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
            <SummaryLine label="Lançamentos encontrados" value={String((reportQuery.data ?? []).length)} />
            <SummaryLine label="Receitas" value={centsToBRL(totals.incomeCents)} color={colors.success} />
            <SummaryLine label="Despesas" value={centsToBRL(totals.expenseCents)} color={colors.danger} />
            <SummaryLine
              label="Saldo"
              value={centsToBRL(totals.balanceCents)}
              color={totals.balanceCents < 0 ? colors.danger : colors.success}
              emphasis
            />
          </View>
        )}

        {reportQuery.data && reportQuery.data.length === 0 ? (
          <EmptyState message="Nenhum lançamento com esses filtros." />
        ) : null}

        <Pressable
          disabled={generatePdf.isPending || !reportQuery.data}
          onPress={() => {
            generatePdf.mutate(
              {
                rows: reportQuery.data ?? [],
                options: {
                  periodLabel: range.label,
                  filterSummaryLabel: filterSummaryLabel(),
                  generatedAtLabel: new Date().toLocaleDateString("pt-BR"),
                },
                fileName: `noazul-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`,
              },
              {
                onError: (error) => Alert.alert("Não foi possível gerar o PDF", error.message),
              },
            );
          }}
          className="items-center rounded-lg bg-brand-600 py-4"
          style={{ opacity: generatePdf.isPending || !reportQuery.data ? 0.6 : 1 }}
        >
          <Text className="text-base font-semibold text-white">
            {generatePdf.isPending ? "Gerando…" : "Gerar PDF"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text className="text-base text-brand-600">Voltar</Text>
      </Pressable>
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Relatórios</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

function SummaryLine({
  label,
  value,
  color,
  emphasis,
}: {
  label: string;
  value: string;
  color?: string;
  emphasis?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={emphasis ? "font-semibold text-gray-900 dark:text-gray-50" : "text-gray-500 dark:text-gray-400"}>
        {label}
      </Text>
      <Text
        className={emphasis ? "font-semibold" : "font-medium"}
        style={color ? { color } : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

function CategoryChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border px-3 py-1.5"
      style={{
        backgroundColor: selected ? colors.brand : "transparent",
        borderColor: selected ? colors.brand : "#D1D5DB",
      }}
    >
      <Text className={selected ? "text-sm font-medium text-white" : "text-sm text-gray-700 dark:text-gray-300"}>
        {label}
      </Text>
    </Pressable>
  );
}
