import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";

import { EmptyState } from "../src/components/ui/EmptyState";
import { LoadingState } from "../src/components/ui/LoadingState";
import { useCurrentOffering, usePurchasePackage, useRestorePurchases } from "../src/features/billing/queries";
import { annualSavingsPercent, findByType, packageTypeLabel } from "../src/features/billing/planPresentation";
import { DIRECT_PLANS } from "../src/features/payments/directPlans";
import { useCreateDirectPayment, useEntitlement, useRefreshEntitlement } from "../src/features/payments/queries";
import { isBillingConfigured } from "../src/services/purchases";
import type { DirectPlanId } from "../src/services/syncApi";
import { useAuthStore } from "../src/stores/authStore";
import { useBillingStore } from "../src/stores/billingStore";

const BENEFITS = [
  "Perfis ilimitados (casa, MEI, bico)",
  "Sem anúncios",
  "Notificações de pagamento ilimitadas",
  "Relatórios em PDF com filtros avançados",
  "Foto dos comprovantes",
  "Exportação de lançamentos (CSV) e backup completo",
  "Ativar backup automático",
];

function PlanCard({
  pkg,
  selected,
  badge,
  subtitle,
  onPress,
}: {
  pkg: PurchasesPackage;
  selected: boolean;
  badge?: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`gap-1 rounded-2xl border-2 p-4 ${
        selected
          ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      {badge ? (
        <View className="mb-1 self-start rounded-full bg-accent-600 px-2.5 py-0.5">
          <Text className="text-xs font-semibold text-white">{badge}</Text>
        </View>
      ) : null}
      <View className="flex-row items-center gap-3">
        <View
          className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected ? "border-brand-600" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {selected ? <View className="h-2.5 w-2.5 rounded-full bg-brand-600" /> : null}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
            {packageTypeLabel(pkg)}
          </Text>
          {subtitle ? <Text className="text-sm text-success-600">{subtitle}</Text> : null}
        </View>
        <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {pkg.product.priceString}
        </Text>
      </View>
    </Pressable>
  );
}

function DirectPlanCard({
  plan,
  selected,
  onPress,
}: {
  plan: (typeof DIRECT_PLANS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`gap-1 rounded-2xl border-2 p-4 ${
        selected
          ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      {plan.badge ? (
        <View className="mb-1 self-start rounded-full bg-accent-600 px-2.5 py-0.5">
          <Text className="text-xs font-semibold text-white">{plan.badge}</Text>
        </View>
      ) : null}
      <View className="flex-row items-center gap-3">
        <View
          className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected ? "border-brand-600" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {selected ? <View className="h-2.5 w-2.5 rounded-full bg-brand-600" /> : null}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">{plan.label}</Text>
          {plan.subtitle ? <Text className="text-sm text-success-600">{plan.subtitle}</Text> : null}
        </View>
        <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">{plan.priceLabel}</Text>
      </View>
    </Pressable>
  );
}

export default function PaywallScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);
  const offeringQuery = useCurrentOffering();
  const purchase = usePurchasePackage();
  const restore = useRestorePurchases();

  const session = useAuthStore((state) => state.session);
  const [selectedDirectPlanId, setSelectedDirectPlanId] = useState<DirectPlanId>("ANNUAL");
  const createDirectPayment = useCreateDirectPayment();
  const entitlementQuery = useEntitlement();
  const refreshEntitlement = useRefreshEntitlement();

  const handleDirectPayment = () => {
    createDirectPayment.mutate(selectedDirectPlanId, {
      onSuccess: async ({ initPoint }) => {
        const result = await WebBrowser.openAuthSessionAsync(initPoint, "noazul://payment/return");
        refreshEntitlement();
        if (result.type === "success") {
          Alert.alert(
            "Pagamento em processamento",
            "Assim que a confirmação chegar do Mercado Pago, seu Premium é ativado automaticamente. Isso costuma levar só alguns instantes.",
          );
        }
      },
      onError: (error) => Alert.alert("Não foi possível iniciar o pagamento", error.message),
    });
  };

  const packages = offeringQuery.data?.availablePackages ?? [];
  const monthlyPkg = findByType(packages, "MONTHLY");
  const annualPkg = findByType(packages, "ANNUAL");
  const lifetimePkg = findByType(packages, "LIFETIME");
  const savingsPercent =
    monthlyPkg && annualPkg ? annualSavingsPercent(monthlyPkg.product.price, annualPkg.product.price) : null;

  const defaultPackage = annualPkg ?? packages[0];
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultPackage?.identifier);
  const selectedPkg = packages.find((pkg) => pkg.identifier === selectedId) ?? defaultPackage;

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerClassName="pb-8">
      <View className="gap-4 bg-brand-600 px-6 pb-8 pt-14">
        <Pressable onPress={() => router.back()} hitSlop={12} className="self-end">
          <Text className="text-base text-white/90">Fechar</Text>
        </Pressable>
        <View className="flex-row items-center gap-3">
          <Image
            source={require("../assets/cyberfort-mark.png")}
            className="h-10 w-10"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-white">Torne-se Premium</Text>
        </View>
        <Text className="text-base text-white/90">
          Para quem quer recursos adicionais e controlar suas finanças com facilidade.
        </Text>
      </View>

      <View className="gap-6 px-6 pt-6">
        {isPremium ? (
          <View className="items-center gap-2 rounded-lg bg-success-50 py-6 dark:bg-success-900/20">
            <Text className="text-base font-semibold text-success-700">Você já é Premium</Text>
          </View>
        ) : offeringQuery.isLoading ? (
          <LoadingState />
        ) : !isBillingConfigured() || packages.length === 0 ? (
          <EmptyState message="Assinatura ainda não disponível nesta versão. Volte em breve." />
        ) : (
          <View className="gap-3">
            {annualPkg ? (
              <PlanCard
                pkg={annualPkg}
                selected={selectedPkg?.identifier === annualPkg.identifier}
                badge="MELHOR ESCOLHA"
                subtitle={savingsPercent ? `Economize ${savingsPercent}% vs. mensal` : undefined}
                onPress={() => setSelectedId(annualPkg.identifier)}
              />
            ) : null}
            {lifetimePkg ? (
              <PlanCard
                pkg={lifetimePkg}
                selected={selectedPkg?.identifier === lifetimePkg.identifier}
                badge="PAGUE 1 VEZ SÓ"
                subtitle="Acesso para sempre, sem mensalidade"
                onPress={() => setSelectedId(lifetimePkg.identifier)}
              />
            ) : null}
            {monthlyPkg ? (
              <PlanCard
                pkg={monthlyPkg}
                selected={selectedPkg?.identifier === monthlyPkg.identifier}
                subtitle="Flexível, cancele quando quiser"
                onPress={() => setSelectedId(monthlyPkg.identifier)}
              />
            ) : null}
            {packages
              .filter((pkg) => pkg !== annualPkg && pkg !== lifetimePkg && pkg !== monthlyPkg)
              .map((pkg) => (
                <PlanCard
                  key={pkg.identifier}
                  pkg={pkg}
                  selected={selectedPkg?.identifier === pkg.identifier}
                  onPress={() => setSelectedId(pkg.identifier)}
                />
              ))}
          </View>
        )}

        <View className="gap-2">
          {BENEFITS.map((benefit) => (
            <View key={benefit} className="flex-row items-center gap-2">
              <Text className="text-success-600">✓</Text>
              <Text className="text-base text-gray-700 dark:text-gray-300">{benefit}</Text>
            </View>
          ))}
        </View>

        {!isPremium ? (
          <View className="gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
            <View className="gap-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
                Ou pague direto com Pix, boleto ou cartão
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Sem passar pela loja de aplicativos — pagamento direto para a CyberFort.
              </Text>
            </View>

            {!session ? (
              <Pressable
                onPress={() => router.push("/login")}
                className="items-center rounded-full border-2 border-brand-600 py-3.5"
              >
                <Text className="text-base font-bold text-brand-600">Entrar com e-mail para continuar</Text>
              </Pressable>
            ) : (
              <>
                <View className="gap-3">
                  {DIRECT_PLANS.map((plan) => (
                    <DirectPlanCard
                      key={plan.id}
                      plan={plan}
                      selected={selectedDirectPlanId === plan.id}
                      onPress={() => setSelectedDirectPlanId(plan.id)}
                    />
                  ))}
                </View>
                <Pressable
                  disabled={createDirectPayment.isPending}
                  onPress={handleDirectPayment}
                  className="flex-row items-center justify-center gap-2 rounded-full border-2 border-brand-600 py-3.5"
                  style={{ opacity: createDirectPayment.isPending ? 0.6 : 1 }}
                >
                  {createDirectPayment.isPending ? <ActivityIndicator color="#065FCE" /> : null}
                  <Text className="text-base font-bold text-brand-600">
                    {createDirectPayment.isPending ? "Abrindo pagamento..." : "Pagar direto"}
                  </Text>
                </Pressable>
                {entitlementQuery.data && !entitlementQuery.data.isPremium ? (
                  <Text className="text-center text-xs text-gray-400 dark:text-gray-500">
                    Conectado como {session.user.email}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        ) : null}

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
      </View>

      {!isPremium && selectedPkg ? (
        <View className="px-6 pt-2">
          <Pressable
            disabled={purchase.isPending}
            onPress={() => {
              purchase.mutate(selectedPkg, {
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
            className="items-center rounded-full bg-accent-600 py-4"
            style={{ opacity: purchase.isPending ? 0.6 : 1 }}
          >
            <Text className="text-base font-bold text-white">
              Assinar {packageTypeLabel(selectedPkg)} — {selectedPkg.product.priceString}
            </Text>
          </Pressable>
          <Text className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
            Cancele a qualquer momento · Pagamento seguro
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
