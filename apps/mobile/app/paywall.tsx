import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { EmptyState } from "../src/components/ui/EmptyState";
import { LoadingState } from "../src/components/ui/LoadingState";
import { useCurrentOffering, usePurchasePackage, useRestorePurchases } from "../src/features/billing/queries";
import { isBillingConfigured } from "../src/services/purchases";
import { useBillingStore } from "../src/stores/billingStore";

const BENEFITS = [
  "Perfis ilimitados (casa, MEI, bico)",
  "Sem anúncios",
  "Exportação e backup (em breve)",
];

export default function PaywallScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);
  const offeringQuery = useCurrentOffering();
  const purchase = usePurchasePackage();
  const restore = useRestorePurchases();

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerClassName="gap-6 px-6 py-14"
    >
      <Pressable onPress={() => router.back()} hitSlop={12} className="self-end">
        <Text className="text-base text-gray-500 dark:text-gray-400">Fechar</Text>
      </Pressable>

      <View className="gap-2">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">NoAzul Premium</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Desbloqueie perfis ilimitados e remova os anúncios.
        </Text>
      </View>

      <View className="gap-2">
        {BENEFITS.map((benefit) => (
          <View key={benefit} className="flex-row items-center gap-2">
            <Text className="text-success-600">✓</Text>
            <Text className="text-base text-gray-700 dark:text-gray-300">{benefit}</Text>
          </View>
        ))}
      </View>

      {isPremium ? (
        <View className="items-center gap-2 rounded-lg bg-success-50 py-6 dark:bg-success-900/20">
          <Text className="text-base font-semibold text-success-700">Você já é Premium</Text>
        </View>
      ) : offeringQuery.isLoading ? (
        <LoadingState />
      ) : !isBillingConfigured() || !offeringQuery.data ? (
        <EmptyState message="Assinatura ainda não disponível nesta versão. Volte em breve." />
      ) : (
        <View className="gap-3">
          {offeringQuery.data.availablePackages.map((pkg) => (
            <Pressable
              key={pkg.identifier}
              disabled={purchase.isPending}
              onPress={() => {
                purchase.mutate(pkg, {
                  onSuccess: () => {
                    Alert.alert("Bem-vindo ao Premium!", "Sua assinatura foi ativada.");
                    router.back();
                  },
                  onError: (error) => {
                    if (error.userCancelled) return;
                    Alert.alert("Não foi possível concluir a compra", error.message);
                  },
                });
              }}
              className="flex-row items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-4 dark:border-brand-800 dark:bg-brand-900/30"
            >
              <Text className="text-base font-medium text-gray-900 dark:text-gray-50">
                {pkg.product.title}
              </Text>
              <Text className="text-base font-semibold text-brand-700 dark:text-brand-300">
                {pkg.product.priceString}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {!isPremium ? (
        <Pressable
          disabled={restore.isPending}
          onPress={() => {
            restore.mutate(undefined, {
              onSuccess: () => {
                Alert.alert(
                  "Restaurar compra",
                  useBillingStore.getState().isPremium
                    ? "Assinatura restaurada com sucesso."
                    : "Nenhuma compra ativa encontrada para restaurar.",
                );
              },
              onError: (error) => {
                Alert.alert("Não foi possível restaurar", error.message);
              },
            });
          }}
          className="items-center py-3"
        >
          <Text className="text-base text-brand-600">Restaurar compra</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
