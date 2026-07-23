import { Text, View } from "react-native";

import type { InstallmentSeriesSummary } from "../../features/installments/schedule";
import { formatYearMonth } from "../../lib/dates";
import { centsToBRL } from "../../lib/money";
import { colors } from "../../lib/theme";

const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function InstallmentCard({ year, entry }: { year: number; entry: InstallmentSeriesSummary }) {
  return (
    <View className="gap-2 border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
      <View className="flex-row items-center gap-2">
        <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.categoryColor }} />
        <Text className="flex-1 text-base text-gray-900 dark:text-gray-50">{entry.baseName}</Text>
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {centsToBRL(entry.totalValueCents)}
        </Text>
      </View>

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {entry.categoryName} · {centsToBRL(entry.installmentValueCents)} × {entry.installmentOf}x
      </Text>

      <View className="flex-row justify-between">
        {entry.monthlyAmountsCents.map((amountCents, index) => {
          const yearMonth = formatYearMonth({ year, month: index + 1 });
          const hasInstallment = amountCents > 0;
          return (
            <View key={yearMonth} className="items-center gap-1">
              <View
                className="h-5 w-5 items-center justify-center rounded"
                style={{ backgroundColor: hasInstallment ? colors.brand : "transparent" }}
              >
                <Text
                  className="text-[10px] font-medium"
                  style={{ color: hasInstallment ? "#FFFFFF" : colors.neutral }}
                >
                  {MONTH_INITIALS[index]}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
