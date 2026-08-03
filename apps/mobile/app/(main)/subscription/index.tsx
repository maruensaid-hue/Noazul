import { router } from "expo-router";
import { Alert, Linking, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { ErrorState } from "../../../src/components/ui/ErrorState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { useCancelSubscription, useSubscription } from "../../../src/features/payments/queries";
import { centsToBRL } from "../../../src/lib/money";
import type { PaymentPlan, PaymentStatus } from "../../../src/services/syncApi";
import { useAuthStore } from "../../../src/stores/authStore";
import { useBillingStore } from "../../../src/stores/billingStore";

const PLAN_LABEL: Record<PaymentPlan, string> = {
  MONTHLY: "Mensal",
  ANNUAL: "Anual",
  LIFETIME: "Vitalício",
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  REFUNDED: "Reembolsado",
  CANCELED: "Cancelado",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function openStoreSubscriptions(): void {
  const url =
    Platform.OS === "ios"
      ? "itms-apps://apps.apple.com/account/subscriptions"
      : "https://play.google.com/store/account/subscriptions";
  void Linking.openURL(url);
}

export default function SubscriptionScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);
  const session = useAuthStore((state) => state.session);
  const subscriptionQuery = useSubscription();
  const cancelSubscription = useCancelSubscription();

  const payments = subscriptionQuery.data?.payments ?? [];
  const activeRecurring = payments.find(
    (payment) =>
      payment.status === "APPROVED" &&
      (payment.plan === "MONTHLY" || payment.plan === "ANNUAL") &&
      payment.mpPreapprovalId,
  );
  const activeLifetime = payments.find((payment) => payment.status === "APPROVED" && payment.plan === "LIFETIME");
  const isDirectPremium = Boolean(session) && subscriptionQuery.data?.isPremium;

  function handleCancel() {
    Alert.alert(
      "Cancelar assinatura",
      "Isso interrompe as próximas cobranças. Seu acesso Premium continua até o fim do período já pago.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar assinatura",
          style: "destructive",
          onPress: () => {
            cancelSubscription.mutate(undefined, {
              onSuccess: () => Alert.alert("Assinatura cancelada", "Você não será mais cobrado."),
              onError: (error) => Alert.alert("Não foi possível cancelar", error.message),
            });
          },
        },
      ],
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-base text-brand-600">Voltar</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Gerenciar assinatura</Text>
        <View style={{ width: 44 }} />
      </View>

      <View className="gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
        {!isPremium ? (
          <View className="gap-3">
            <Text className="text-base text-gray-700 dark:text-gray-300">Você ainda não é Premium.</Text>
            <Pressable
              onPress={() => router.push("/paywall")}
              className="items-center rounded-full bg-accent-600 py-3.5"
            >
              <Text className="text-base font-bold text-white">Ver planos</Text>
            </Pressable>
          </View>
        ) : subscriptionQuery.isLoading && session ? (
          <LoadingState />
        ) : subscriptionQuery.isError ? (
          <ErrorState
            message="Não foi possível carregar os dados da assinatura."
            onRetry={() => subscriptionQuery.refetch()}
          />
        ) : activeRecurring && isDirectPremium ? (
          <View className="gap-2">
            <Text className="text-base font-semibold text-success-700">Premium ativo — {PLAN_LABEL[activeRecurring.plan]}</Text>
            {subscriptionQuery.data?.premiumUntil ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Próxima cobrança: {formatDate(subscriptionQuery.data.premiumUntil)}
              </Text>
            ) : null}
            <Pressable
              disabled={cancelSubscription.isPending}
              onPress={handleCancel}
              className="mt-2 items-center rounded-full border-2 border-danger-600 py-3.5"
              style={{ opacity: cancelSubscription.isPending ? 0.6 : 1 }}
            >
              <Text className="text-base font-bold text-danger-600">
                {cancelSubscription.isPending ? "Cancelando..." : "Cancelar assinatura"}
              </Text>
            </Pressable>
          </View>
        ) : activeLifetime && isDirectPremium ? (
          <View className="gap-1">
            <Text className="text-base font-semibold text-success-700">Premium ativo — Vitalício</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Acesso permanente, sem cobranças futuras.
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            <Text className="text-base font-semibold text-success-700">Premium ativo</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Assinado pela loja de aplicativos ({Platform.OS === "ios" ? "App Store" : "Google Play"}).
              Cancelamentos e alterações de forma de pagamento são feitos por lá, não aqui.
            </Text>
            <Pressable
              onPress={openStoreSubscriptions}
              className="mt-2 items-center rounded-full border-2 border-brand-600 py-3.5"
            >
              <Text className="text-base font-bold text-brand-600">Gerenciar na loja</Text>
            </Pressable>
          </View>
        )}
      </View>

      {payments.length > 0 ? (
        <View className="gap-1 p-4">
          <Text className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Histórico de pagamentos
          </Text>
          {payments.map((payment) => (
            <View
              key={payment.id}
              className="flex-row items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800"
            >
              <View className="gap-0.5">
                <Text className="text-base text-gray-900 dark:text-gray-50">{PLAN_LABEL[payment.plan]}</Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">{formatDate(payment.createdAt)}</Text>
              </View>
              <View className="items-end gap-0.5">
                <Text className="text-base font-medium text-gray-900 dark:text-gray-50">
                  {centsToBRL(payment.amountCents)}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">{STATUS_LABEL[payment.status]}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
