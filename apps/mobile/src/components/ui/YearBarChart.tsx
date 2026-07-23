import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { YearMonthAmounts } from "../../features/summary/repository";
import { monthShortLabel } from "../../lib/dates";
import { colors } from "../../lib/theme";

const CHART_HEIGHT = 96;
const MIN_BAR_HEIGHT = 2;

/**
 * Simple paired income/expense bar chart, 12 columns — plain Views, no chart
 * library (same "evitar libs de gráfico pesadas" rule as DonutChart).
 */
export function YearBarChart({ months }: { months: readonly YearMonthAmounts[] }) {
  const maxCents = Math.max(1, ...months.map((month) => Math.max(month.incomeCents, month.expenseCents)));

  return (
    <View className="flex-row items-end justify-between gap-1">
      {months.map((month) => {
        const incomeHeight = Math.max(MIN_BAR_HEIGHT, (month.incomeCents / maxCents) * CHART_HEIGHT);
        const expenseHeight = Math.max(MIN_BAR_HEIGHT, (month.expenseCents / maxCents) * CHART_HEIGHT);
        return (
          <Pressable
            key={month.yearMonth}
            onPress={() => router.push(`/(main)/month/${month.yearMonth}`)}
            className="flex-1 items-center gap-1"
          >
            <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
              <View
                style={{ height: incomeHeight, backgroundColor: colors.success }}
                className="w-1.5 rounded-t-sm"
              />
              <View
                style={{ height: expenseHeight, backgroundColor: colors.danger }}
                className="w-1.5 rounded-t-sm"
              />
            </View>
            <Text className="text-[10px] capitalize text-gray-400 dark:text-gray-500">
              {monthShortLabel(month.yearMonth).replace(".", "")}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
