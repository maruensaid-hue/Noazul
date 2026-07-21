import { Text, View } from "react-native";

export default function NewTransactionScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-lg font-semibold">Novo lançamento</Text>
      <Text className="mt-2 text-gray-500">Implementado na Fase 1 do roadmap.</Text>
    </View>
  );
}
