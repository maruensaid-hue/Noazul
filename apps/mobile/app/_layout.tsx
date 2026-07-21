// Must be the first import evaluated so gesture-handler installs itself before
// any other native event handling is set up.
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import migrations from "../drizzle/migrations";
import { db } from "../src/db/client";
import { getDefaultProfileId, seedDefaultProfile } from "../src/db/seed";
import { useProfileStore } from "../src/stores/profileStore";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { success: migrated, error: migrationError } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);
  const setActiveProfileId = useProfileStore((state) => state.setActiveProfileId);

  useEffect(() => {
    if (!migrated) return;
    seedDefaultProfile(db)
      .then(() => getDefaultProfileId(db))
      .then((profileId) => {
        if (profileId) setActiveProfileId(profileId);
        setSeeded(true);
      })
      .catch((err: Error) => setSeedError(err));
  }, [migrated, setActiveProfileId]);

  const error = migrationError ?? seedError;
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-red-600">
          Erro ao preparar o banco de dados: {error.message}
        </Text>
      </View>
    );
  }

  if (!migrated || !seeded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
