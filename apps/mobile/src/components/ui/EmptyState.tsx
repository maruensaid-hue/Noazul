import { Pressable, Text, View } from "react-native";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-4 px-6 py-16">
      <Text className="text-center text-gray-400 dark:text-gray-500">{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="rounded-lg bg-brand-600 px-4 py-2.5">
          <Text className="font-medium text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
