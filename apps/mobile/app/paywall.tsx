import { Text, View } from "react-native";

export default function PaywallScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-gray-900">
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">NoAzul Premium</Text>
      <Text className="mt-2 text-gray-500 dark:text-gray-400">
        Implementado na Fase 5 do roadmap.
      </Text>
    </View>
  );
}
