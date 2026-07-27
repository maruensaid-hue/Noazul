import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

import { useRefreshEntitlement } from "../../src/features/payments/queries";

type ReturnStatus = "success" | "pending" | "failure";

const STATUS_COPY: Record<ReturnStatus, { title: string; message: string }> = {
  success: {
    title: "Pagamento aprovado!",
    message:
      "Assim que a confirmação chegar do Mercado Pago (geralmente poucos segundos), seu Premium é ativado automaticamente.",
  },
  pending: {
    title: "Pagamento em análise",
    message: "Seu pagamento está sendo processado. Avisaremos assim que for confirmado.",
  },
  failure: {
    title: "Pagamento não concluído",
    message: "Não foi possível concluir o pagamento dessa vez. Você pode tentar novamente quando quiser.",
  },
};

function isReturnStatus(value: string | undefined): value is ReturnStatus {
  return value === "success" || value === "pending" || value === "failure";
}

/**
 * Where the noazul://payment/return deep link (see server/mercadoPago.ts's
 * deepLink()) lands the app after checkout — the OS opens this route
 * directly, expo-web-browser's openBrowserAsync doesn't intercept it.
 */
export default function PaymentReturnScreen() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const refreshEntitlement = useRefreshEntitlement();
  const copy = STATUS_COPY[isReturnStatus(status) ? status : "success"];

  useEffect(() => {
    refreshEntitlement();
  }, [refreshEntitlement]);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6 dark:bg-gray-900">
      <Text className="text-center text-xl font-bold text-gray-900 dark:text-gray-50">{copy.title}</Text>
      <Text className="text-center text-base text-gray-600 dark:text-gray-300">{copy.message}</Text>
      <Pressable
        onPress={() => router.replace("/paywall")}
        className="mt-4 rounded-full bg-brand-600 px-6 py-3"
      >
        <Text className="text-base font-bold text-white">Voltar</Text>
      </Pressable>
    </View>
  );
}
