import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { useSendLoginLink } from "../src/features/auth/queries";
import { isAuthConfigured } from "../src/services/supabaseClient";
import { useAuthStore } from "../src/stores/authStore";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const sendLink = useSendLoginLink();
  const session = useAuthStore((state) => state.session);

  // Fires once useLoginDeepLink exchanges the e-mail link's code for a session.
  useEffect(() => {
    if (session) router.back();
  }, [session]);

  const handleSendLink = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      Alert.alert("E-mail inválido", "Digite um e-mail válido para continuar.");
      return;
    }
    sendLink.mutate(email.trim(), {
      onSuccess: () => setLinkSent(true),
      onError: (error) => Alert.alert("Não foi possível enviar o link", error.message),
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="gap-2 bg-brand-600 px-6 pb-8 pt-14">
        <Pressable onPress={() => router.back()} hitSlop={12} className="self-end">
          <Text className="text-base text-white/90">Fechar</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-white">Entrar com e-mail</Text>
        <Text className="text-base text-white/90">
          Use seu e-mail para pagar direto (Pix, boleto ou cartão) e sincronizar seu Premium.
        </Text>
      </View>

      <View className="gap-4 px-6 pt-6">
        {!isAuthConfigured() ? (
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Login ainda não está disponível nesta versão. Volte em breve.
          </Text>
        ) : linkSent ? (
          <View className="gap-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Verifique seu e-mail
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300">
              Enviamos um link de acesso para {email.trim()}. Abra o e-mail direto no seu
              celular (onde o NoAzul está instalado) e toque no link — esta tela fecha sozinha
              assim que você entrar.
            </Text>
            <Pressable onPress={() => setLinkSent(false)} className="items-center py-2">
              <Text className="text-sm text-brand-600">Usar outro e-mail</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="voce@exemplo.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                className="rounded-lg border border-gray-200 px-3 py-3 text-base text-gray-900 dark:border-gray-700 dark:text-gray-50"
              />
            </View>
            <Pressable
              disabled={sendLink.isPending}
              onPress={handleSendLink}
              className="items-center rounded-full bg-brand-600 py-4"
              style={{ opacity: sendLink.isPending ? 0.6 : 1 }}
            >
              <Text className="text-base font-bold text-white">
                {sendLink.isPending ? "Enviando..." : "Enviar link por e-mail"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
