import { View } from "react-native";

interface BudgetProgressBarProps {
  fraction: number;
  overspent: boolean;
}

export function BudgetProgressBar({ fraction, overspent }: BudgetProgressBarProps) {
  return (
    <View className="h-2 overflow-hidden rounded-full bg-gray-100">
      <View
        className="h-full rounded-full"
        style={{
          width: `${Math.round(fraction * 100)}%`,
          backgroundColor: overspent ? "#DC2626" : "#2563EB",
        }}
      />
    </View>
  );
}
