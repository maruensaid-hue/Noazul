import { Text, View } from "react-native";

export default function OnboardingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-lg font-semibold">Bem-vindo ao NoAzul</Text>
      <Text className="mt-2 text-center text-gray-500">
        Onboarding de 1 tela — implementado na Fase 4 do roadmap. O perfil padrão
        &quot;Casa&quot; já é criado automaticamente no primeiro boot.
      </Text>
    </View>
  );
}
