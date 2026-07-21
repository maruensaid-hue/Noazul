import { Text, View } from "react-native";

import type { CategorySlice } from "../../features/summary/derived";
import { centsToBRL } from "../../lib/money";

export function DonutChartLegend({ slices }: { slices: readonly CategorySlice[] }) {
  return (
    <View className="gap-1.5">
      {slices.map((slice) => (
        <View key={slice.categoryId ?? "none"} className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
          <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">{slice.name}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(slice.fraction * 100)}%
          </Text>
          <Text className="w-20 text-right text-sm font-medium text-gray-900 dark:text-gray-50">
            {centsToBRL(slice.amountCents)}
          </Text>
        </View>
      ))}
    </View>
  );
}
