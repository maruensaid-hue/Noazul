import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useBillingStore } from "../../../src/stores/billingStore";

export default function SettingsScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-base text-brand-600">Voltar</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Ajustes</Text>
        <View style={{ width: 44 }} />
      </View>

      <Pressable
        onPress={() => router.push("/(main)/profiles")}
        className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800"
      >
        <Text className="text-base text-gray-900 dark:text-gray-50">Perfis</Text>
        <Text className="text-gray-400 dark:text-gray-500">›</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          if (!isPremium) router.push("/paywall");
        }}
        className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800"
      >
        <Text className="text-base text-gray-900 dark:text-gray-50">Remover anúncios</Text>
        {isPremium ? (
          <Text className="text-sm font-medium text-brand-600">Premium</Text>
        ) : (
          <Text className="text-gray-400 dark:text-gray-500">›</Text>
        )}
      </Pressable>

      <View className="flex-1 items-center justify-end px-6 pb-10">
        <Text className="text-sm text-gray-400 dark:text-gray-500">NoAzul v0.1.0</Text>
      </View>
    </View>
  );
}
