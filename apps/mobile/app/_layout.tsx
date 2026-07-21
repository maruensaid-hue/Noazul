import "../global.css";

import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import migrations from "../drizzle/migrations";
import { db } from "../src/db/client";
import { seedDefaultProfile } from "../src/db/seed";

export default function RootLayout() {
  const { success: migrated, error: migrationError } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!migrated) return;
    seedDefaultProfile(db)
      .then(() => setSeeded(true))
      .catch((err: Error) => setSeedError(err));
  }, [migrated]);

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
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
