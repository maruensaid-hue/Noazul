import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { FREE_REMINDER_LIMIT } from "../../../src/features/reminders/gate";
import {
  usePaymentRemindersEnabled,
  useSetPaymentRemindersEnabled,
} from "../../../src/features/reminders/queries";
import { requestPermission } from "../../../src/services/notifications";
import { useBillingStore } from "../../../src/stores/billingStore";

export default function SettingsScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);
  const remindersEnabledQuery = usePaymentRemindersEnabled();
  const setRemindersEnabled = useSetPaymentRemindersEnabled();
  const remindersEnabled = remindersEnabledQuery.data === true;

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

      <Pressable
        onPress={() => {
          if (remindersEnabled) {
            setRemindersEnabled.mutate(false);
            return;
          }
          requestPermission()
            .then((granted) => {
              if (granted) {
                setRemindersEnabled.mutate(true);
              } else {
                Alert.alert(
                  "Permissão negada",
                  "Ative as notificações do NoAzul nos ajustes do sistema para receber lembretes de pagamento.",
                );
              }
            })
            .catch(() => {
              Alert.alert("Não foi possível ativar", "Tente novamente em instantes.");
            });
        }}
        className="gap-1 border-b border-gray-100 px-4 py-4 dark:border-gray-800"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base text-gray-900 dark:text-gray-50">Lembretes de pagamento</Text>
          <Text className={remindersEnabled ? "text-sm font-medium text-brand-600" : "text-gray-400 dark:text-gray-500"}>
            {remindersEnabled ? "Ativado" : "Desativado"}
          </Text>
        </View>
        {!isPremium ? (
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            Grátis: lembretes para até {FREE_REMINDER_LIMIT} contas mais próximas · Premium: ilimitados
          </Text>
        ) : null}
      </Pressable>

      <Pressable
        onPress={() => router.push(isPremium ? "/(main)/backup" : "/paywall")}
        className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800"
      >
        <Text className="text-base text-gray-900 dark:text-gray-50">Exportar e backup</Text>
        {isPremium ? (
          <Text className="text-gray-400 dark:text-gray-500">›</Text>
        ) : (
          <Text className="text-sm font-medium text-brand-600">Premium</Text>
        )}
      </Pressable>

      <View className="flex-1 items-center justify-end px-6 pb-10">
        <Text className="text-sm text-gray-400 dark:text-gray-500">NoAzul v0.1.0</Text>
      </View>
    </View>
  );
}
