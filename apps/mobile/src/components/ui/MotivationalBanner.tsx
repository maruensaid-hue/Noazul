import { Text, View } from "react-native";

import { motivationalPhrase, motivationalTone } from "../../features/motivation/phrases";

const TONE_CLASSES = {
  danger: "border-danger-100 bg-danger-50 dark:border-danger-700/40 dark:bg-danger-700/10",
  warning: "border-warning-100 bg-warning-50 dark:border-warning-700/40 dark:bg-warning-700/10",
  neutral: "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60",
  success: "border-success-100 bg-success-50 dark:border-success-700/40 dark:bg-success-700/10",
} as const;

const TONE_TEXT_CLASSES = {
  danger: "text-danger-700 dark:text-danger-500",
  warning: "text-warning-700 dark:text-warning-500",
  neutral: "text-gray-600 dark:text-gray-300",
  success: "text-success-700 dark:text-success-500",
} as const;

/** Prominent, always-visible motivational message keyed to the month's saldo seguro. */
export function MotivationalBanner({ safeBalanceCents }: { safeBalanceCents: number }) {
  const tone = motivationalTone(safeBalanceCents);
  return (
    <View className={`mx-4 -mt-3 rounded-xl border px-4 py-3 shadow-sm ${TONE_CLASSES[tone]}`}>
      <Text className={`text-sm font-medium ${TONE_TEXT_CLASSES[tone]}`}>
        {motivationalPhrase(safeBalanceCents)}
      </Text>
    </View>
  );
}
