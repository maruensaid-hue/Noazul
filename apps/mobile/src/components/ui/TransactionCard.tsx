import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { TransactionRow } from "../../features/transactions/types";
import { centsToBRL } from "../../lib/money";

interface TransactionCardProps {
  transaction: TransactionRow;
  categoryName?: string;
  categoryColor?: string;
  onToggleStatus: (id: string) => void;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

export function TransactionCard({
  transaction,
  categoryName,
  categoryColor,
  onToggleStatus,
  onPress,
  onLongPress,
}: TransactionCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const isIncome = transaction.type === "INCOME";
  const isPaid = transaction.status === "PAID";
  const day = transaction.dueDate.slice(8, 10);

  return (
    <Swipeable
      ref={swipeableRef}
      overshootRight={false}
      renderRightActions={() => (
        <View
          className="w-28 items-center justify-center"
          style={{ backgroundColor: isPaid ? "#F59E0B" : "#22C55E" }}
        >
          <Text className="font-semibold text-white">
            {isPaid ? "Marcar pendente" : "Marcar pago"}
          </Text>
        </View>
      )}
      onSwipeableOpen={() => {
        onToggleStatus(transaction.id);
        swipeableRef.current?.close();
      }}
    >
      <Pressable
        onPress={() => onPress(transaction.id)}
        onLongPress={() => onLongPress(transaction.id)}
        className="flex-row items-center gap-3 border-b border-gray-100 bg-white px-4 py-3"
      >
        <View className="w-9 items-center">
          <Text className="text-[10px] text-gray-400">DIA</Text>
          <Text className="text-base font-semibold text-gray-700">{day}</Text>
        </View>
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: categoryColor ?? "#9CA3AF" }}
        />
        <View className="flex-1">
          <Text
            className={isPaid ? "text-base text-gray-400 line-through" : "text-base text-gray-900"}
          >
            {transaction.name}
          </Text>
          {categoryName ? <Text className="text-xs text-gray-400">{categoryName}</Text> : null}
        </View>
        <Text
          className="text-base font-semibold"
          style={{ color: isIncome ? "#16A34A" : isPaid ? "#9CA3AF" : "#DC2626" }}
        >
          {isIncome ? "+" : "-"}
          {centsToBRL(transaction.amountCents)}
        </Text>
      </Pressable>
    </Swipeable>
  );
}
