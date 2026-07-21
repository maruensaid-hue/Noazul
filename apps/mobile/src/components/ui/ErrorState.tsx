import { Pressable, Text, View } from "react-native";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Algo deu errado.", onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6 dark:bg-gray-900">
      <Text className="text-center text-danger-600">{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} className="rounded-lg bg-brand-600 px-4 py-2.5">
          <Text className="font-medium text-white">Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
