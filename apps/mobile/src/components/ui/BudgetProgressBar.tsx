import { View } from "react-native";

import { colors } from "../../lib/theme";

interface BudgetProgressBarProps {
  fraction: number;
  overspent: boolean;
}

export function BudgetProgressBar({ fraction, overspent }: BudgetProgressBarProps) {
  return (
    <View className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
      <View
        className="h-full rounded-full"
        style={{
          width: `${Math.round(fraction * 100)}%`,
          backgroundColor: overspent ? colors.danger : colors.brand,
        }}
      />
    </View>
  );
}
