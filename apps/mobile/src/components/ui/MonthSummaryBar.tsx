import { Text, View } from "react-native";

import type { MonthSummary } from "../../features/summary/repository";
import { centsToBRL } from "../../lib/money";
import { colors } from "../../lib/theme";

function SummaryLine({
  label,
  cents,
  color,
  emphasis = false,
}: {
  label: string;
  cents: number;
  /** Status accent (green/red/amber). Omit for a plain neutral amount. */
  color?: string;
  emphasis?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text
        className={
          emphasis
            ? "font-semibold text-gray-900 dark:text-gray-50"
            : "text-gray-500 dark:text-gray-400"
        }
      >
        {label}
      </Text>
      <Text
        className={`${emphasis ? "font-semibold" : "font-medium"} ${color ? "" : "text-gray-700 dark:text-gray-300"}`}
        style={color ? { color } : undefined}
      >
        {centsToBRL(cents)}
      </Text>
    </View>
  );
}

export function MonthSummaryBar({ summary }: { summary: MonthSummary }) {
  return (
    <View className="gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60">
      <SummaryLine label="Receita" cents={summary.incomeCents} color={colors.success} />
      <SummaryLine label="Despesas" cents={summary.expenseTotalCents} color={colors.danger} />
      <SummaryLine label="Já pago" cents={summary.expensePaidCents} />
      <SummaryLine label="Falta pagar" cents={summary.expensePendingCents} color={colors.warning} />
      <View className="mt-1 border-t border-gray-200 pt-2 dark:border-gray-700">
        <SummaryLine
          label="Saldo seguro"
          cents={summary.safeBalanceCents}
          color={summary.safeBalanceCents < 0 ? colors.danger : colors.success}
          emphasis
        />
      </View>
    </View>
  );
}
