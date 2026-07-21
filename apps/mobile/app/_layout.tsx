// Must be the first import evaluated so gesture-handler installs itself before
// any other native event handling is set up.
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorState } from "../src/components/ui/ErrorState";
import { LoadingState } from "../src/components/ui/LoadingState";
import migrations from "../drizzle/migrations";
import { db } from "../src/db/client";
import { getActiveProfileId } from "../src/features/profiles/repository";
import { useProfileStore } from "../src/stores/profileStore";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { success: migrated, error: migrationError } = useMigrations(db, migrations);
  const [checkedProfile, setCheckedProfile] = useState(false);
  const [checkError, setCheckError] = useState<Error | null>(null);
  const setActiveProfileId = useProfileStore((state) => state.setActiveProfileId);

  useEffect(() => {
    if (!migrated) return;
    getActiveProfileId()
      .then((profileId) => {
        // No profile yet (first boot ever): activeProfileId stays null and
        // app/index.tsx sends the user to onboarding, which creates one.
        if (profileId) setActiveProfileId(profileId);
        setCheckedProfile(true);
      })
      .catch((err: Error) => setCheckError(err));
  }, [migrated, setActiveProfileId]);

  const error = migrationError ?? checkError;
  if (error) {
    return <ErrorState message={`Erro ao preparar o banco de dados: ${error.message}`} />;
  }

  if (!migrated || !checkedProfile) {
    return <LoadingState />;
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
