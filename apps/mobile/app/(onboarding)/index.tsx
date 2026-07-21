import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";

import { useCreateAndActivateProfile } from "../../src/features/profiles/queries";
import { DEFAULT_PROFILE_NAME } from "../../src/features/profiles/repository";
import { currentYearMonth } from "../../src/lib/dates";

export default function OnboardingScreen() {
  const [name, setName] = useState("");
  const createProfile = useCreateAndActivateProfile();

  function handleStart() {
    createProfile.mutate(name || DEFAULT_PROFILE_NAME, {
      onSuccess: () => router.replace(`/month/${currentYearMonth()}`),
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">NoAzul</Text>
          <Text className="text-base text-gray-500 dark:text-gray-400">
            O app de contas do mês, offline e sem cadastro. Sem banco, sem complicação.
          </Text>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Nome do perfil (opcional)
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={DEFAULT_PROFILE_NAME}
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
            className="rounded-lg border border-gray-200 px-3 py-3 text-base text-gray-900 dark:border-gray-700 dark:text-gray-50"
          />
        </View>

        <Pressable
          onPress={handleStart}
          disabled={createProfile.isPending}
          className="items-center rounded-lg bg-brand-600 py-4"
          style={{ opacity: createProfile.isPending ? 0.6 : 1 }}
        >
          <Text className="text-base font-semibold text-white">Começar</Text>
        </Pressable>

        {createProfile.isError ? (
          <Text className="text-center text-sm text-danger-600">
            Não foi possível criar o perfil. Tente novamente.
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
