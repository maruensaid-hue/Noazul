import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-lg font-semibold">Lançamento {id}</Text>
      <Text className="mt-2 text-gray-500">Implementado na Fase 1 do roadmap.</Text>
    </View>
  );
}
