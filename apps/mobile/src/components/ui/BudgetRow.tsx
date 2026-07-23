import { Pressable, Text, View } from "react-native";

import {
  budgetProgressFraction,
  budgetStatus,
  remainingBudgetCents,
  type BudgetOverviewEntry,
} from "../../features/budgets/overview";
import { centsToBRL } from "../../lib/money";
import { colors } from "../../lib/theme";
import { BudgetProgressBar } from "./BudgetProgressBar";

export function BudgetRow({ entry, onPress }: { entry: BudgetOverviewEntry; onPress: () => void }) {
  const hasBudget = entry.limitCents !== null;
  const status = budgetStatus(entry);
  const remaining = remainingBudgetCents(entry);
  const statusTextColor =
    status === "overspent" ? colors.danger : status === "attention" ? colors.warning : undefined;

  return (
    <Pressable onPress={onPress} className="gap-2 border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
      <View className="flex-row items-center gap-2">
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: entry.categoryColor }}
        />
        <Text className="flex-1 text-base text-gray-900 dark:text-gray-50">
          {entry.categoryName}
        </Text>
        {hasBudget ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {centsToBRL(entry.spentCents)} de {centsToBRL(entry.limitCents!)}
          </Text>
        ) : (
          <Text className="text-sm text-gray-400 dark:text-gray-500">Definir orçamento</Text>
        )}
      </View>

      {hasBudget ? (
        <>
          <BudgetProgressBar fraction={budgetProgressFraction(entry)} status={status} />
          <Text
            className={statusTextColor ? "text-xs" : "text-xs text-gray-500 dark:text-gray-400"}
            style={statusTextColor ? { color: statusTextColor } : undefined}
          >
            {status === "overspent"
              ? `Estourado em ${centsToBRL(Math.abs(remaining ?? 0))}`
              : status === "attention"
                ? `Atenção: ainda pode gastar ${centsToBRL(remaining ?? 0)}`
                : `Ainda pode gastar ${centsToBRL(remaining ?? 0)}`}
          </Text>
        </>
      ) : entry.spentCents > 0 ? (
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          Já gastou {centsToBRL(entry.spentCents)}
        </Text>
      ) : null}
    </Pressable>
  );
}
