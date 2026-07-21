import { Text, View } from "react-native";

import type { MonthSummary } from "../../features/summary/repository";
import { centsToBRL } from "../../lib/money";

function SummaryLine({
  label,
  cents,
  color,
  emphasis = false,
}: {
  label: string;
  cents: number;
  color: string;
  emphasis?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={emphasis ? "font-semibold text-gray-900" : "text-gray-500"}>{label}</Text>
      <Text className={emphasis ? "font-semibold" : "font-medium"} style={{ color }}>
        {centsToBRL(cents)}
      </Text>
    </View>
  );
}

export function MonthSummaryBar({ summary }: { summary: MonthSummary }) {
  return (
    <View className="gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
      <SummaryLine label="Receita" cents={summary.incomeCents} color="#16A34A" />
      <SummaryLine label="Despesas" cents={summary.expenseTotalCents} color="#DC2626" />
      <SummaryLine label="Já pago" cents={summary.expensePaidCents} color="#374151" />
      <SummaryLine label="Falta pagar" cents={summary.expensePendingCents} color="#D97706" />
      <View className="mt-1 border-t border-gray-200 pt-2">
        <SummaryLine
          label="Saldo seguro"
          cents={summary.safeBalanceCents}
          color={summary.safeBalanceCents < 0 ? "#DC2626" : "#16A34A"}
          emphasis
        />
      </View>
    </View>
  );
}
