import * as Haptics from "expo-haptics";
import { ScrollView, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { DonutChart } from "../../components/ui/DonutChart";
import { DonutChartLegend } from "../../components/ui/DonutChartLegend";
import { MonthSummaryBar } from "../../components/ui/MonthSummaryBar";
import { centsToBRL } from "../../lib/money";
import { colors } from "../../lib/theme";
import type { CategorySlice } from "./derived";
import type { MonthSummary } from "./repository";

export const SHEET_COLLAPSED_HEIGHT = 64;
export const SHEET_EXPANDED_HEIGHT = 520;

const DRAG_RANGE = SHEET_EXPANDED_HEIGHT - SHEET_COLLAPSED_HEIGHT;
const SPRING_CONFIG = { damping: 22, stiffness: 220 };
const TAP_THRESHOLD_PX = 5;

function triggerHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

interface MonthSummarySheetProps {
  summary: MonthSummary;
  categorySlices: readonly CategorySlice[];
}

/**
 * Draggable summary panel anchored to the bottom of the month screen.
 * Collapsed, it peeks "Saldo seguro" only (the number the product's whole
 * value prop is built on — see noazul-blueprint.md §2.3); dragging or
 * tapping the handle expands it into the full breakdown + donut chart.
 */
export function MonthSummarySheet({ summary, categorySlices }: MonthSummarySheetProps) {
  const translateY = useSharedValue(DRAG_RANGE);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.min(Math.max(startY.value + event.translationY, 0), DRAG_RANGE);
    })
    .onEnd((event) => {
      const isTap = Math.abs(event.translationY) < TAP_THRESHOLD_PX;
      const shouldExpand = isTap
        ? translateY.value > DRAG_RANGE / 2
        : translateY.value < DRAG_RANGE / 2 || event.velocityY < -500;
      const wasExpanded = startY.value < DRAG_RANGE / 2;
      if (shouldExpand !== wasExpanded) {
        runOnJS(triggerHaptic)();
      }
      translateY.value = withSpring(shouldExpand ? 0 : DRAG_RANGE, SPRING_CONFIG);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[{ height: SHEET_EXPANDED_HEIGHT }, sheetStyle]}
      className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <GestureDetector gesture={panGesture}>
        <View className="items-center gap-2 pb-2 pt-2.5">
          <View className="h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          <View className="w-full flex-row items-center justify-between px-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Saldo seguro</Text>
            <Text
              className="text-base font-semibold"
              style={{ color: summary.safeBalanceCents < 0 ? colors.danger : colors.success }}
            >
              {centsToBRL(summary.safeBalanceCents)}
            </Text>
          </View>
        </View>
      </GestureDetector>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8">
        <MonthSummaryBar summary={summary} />

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500 dark:text-gray-400">Média diária de despesas</Text>
          <Text className="font-medium text-gray-900 dark:text-gray-50">
            {centsToBRL(summary.averageDailyExpenseCents)}
          </Text>
        </View>

        <View className="items-center gap-4">
          <Text className="self-start text-sm font-medium text-gray-600 dark:text-gray-300">
            Despesas por categoria
          </Text>
          <DonutChart slices={categorySlices} />
          {categorySlices.length > 0 ? (
            <DonutChartLegend slices={categorySlices} />
          ) : (
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              Nenhuma despesa neste mês ainda.
            </Text>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}
