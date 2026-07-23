import { View } from "react-native";

import type { BudgetStatus } from "../../features/budgets/overview";
import { colors } from "../../lib/theme";

interface BudgetProgressBarProps {
  fraction: number;
  status: BudgetStatus;
}

const FILL_COLOR: Record<BudgetStatus, string> = {
  "no-goal": colors.brand,
  ok: colors.brand,
  attention: colors.warning,
  overspent: colors.danger,
};

export function BudgetProgressBar({ fraction, status }: BudgetProgressBarProps) {
  return (
    <View className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
      <View
        className="h-full rounded-full"
        style={{
          width: `${Math.round(fraction * 100)}%`,
          backgroundColor: FILL_COLOR[status],
        }}
      />
    </View>
  );
}
