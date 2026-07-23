import { ActivityIndicator, View } from "react-native";

import { colors } from "../../lib/theme";

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}
