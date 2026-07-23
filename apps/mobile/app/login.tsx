import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { useSendLoginCode, useVerifyLoginCode } from "../src/features/auth/queries";
import { isAuthConfigured } from "../src/services/supabaseClient";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const sendCode = useSendLoginCode();
  const verifyCode = useVerifyLoginCode();

  const handleSendCode = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      Alert.alert("E-mail inválido", "Digite um e-mail válido para continuar.");
      return;
    }
    sendCode.mutate(email.trim(), {
      onSuccess: () => setCodeSent(true),
      onError: (error) => Alert.alert("Não foi possível enviar o código", error.message),
    });
  };

  const handleVerifyCode = () => {
    if (code.trim().length < 6) {
      Alert.alert("Código incompleto", "Digite o código de 6 dígitos que enviamos por e-mail.");
      return;
    }
    verifyCode.mutate(
      { email: email.trim(), code: code.trim() },
      {
        onSuccess: () => router.back(),
        onError: (error) => Alert.alert("Não foi possível confirmar", error.message),
      },
    );
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
        ) : (
          <>
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                editable={!codeSent}
                placeholder="voce@exemplo.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                className="rounded-lg border border-gray-200 px-3 py-3 text-base text-gray-900 dark:border-gray-700 dark:text-gray-50"
                style={{ opacity: codeSent ? 0.6 : 1 }}
              />
            </View>

            {!codeSent ? (
              <Pressable
                disabled={sendCode.isPending}
                onPress={handleSendCode}
                className="items-center rounded-full bg-brand-600 py-4"
                style={{ opacity: sendCode.isPending ? 0.6 : 1 }}
              >
                <Text className="text-base font-bold text-white">
                  {sendCode.isPending ? "Enviando..." : "Enviar código por e-mail"}
                </Text>
              </Pressable>
            ) : (
              <>
                <View className="gap-1.5">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Código recebido por e-mail
                  </Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="rounded-lg border border-gray-200 px-3 py-3 text-center text-2xl tracking-[8px] text-gray-900 dark:border-gray-700 dark:text-gray-50"
                  />
                </View>
                <Pressable
                  disabled={verifyCode.isPending}
                  onPress={handleVerifyCode}
                  className="items-center rounded-full bg-accent-600 py-4"
                  style={{ opacity: verifyCode.isPending ? 0.6 : 1 }}
                >
                  <Text className="text-base font-bold text-white">
                    {verifyCode.isPending ? "Confirmando..." : "Confirmar código"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setCodeSent(false);
                    setCode("");
                  }}
                  className="items-center py-2"
                >
                  <Text className="text-sm text-brand-600">Usar outro e-mail</Text>
                </Pressable>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
}
