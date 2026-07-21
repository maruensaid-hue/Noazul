import { eq } from "drizzle-orm";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { db } from "../../../src/db/client";
import { categories, profiles } from "../../../src/db/schema";
import { isValidYearMonth, shiftYearMonth, yearMonthLabel } from "../../../src/lib/dates";

export default function MonthScreen() {
  const { ym } = useLocalSearchParams<{ ym: string }>();
  const yearMonth = isValidYearMonth(ym ?? "") ? ym! : undefined;

  const [profileName, setProfileName] = useState<string | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [profile] = await db
        .select({ id: profiles.id, name: profiles.name })
        .from(profiles)
        .where(eq(profiles.isDefault, true))
        .limit(1);
      if (!profile || cancelled) return;

      const profileCategories = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.profileId, profile.id));

      if (cancelled) return;
      setProfileName(profile.name);
      setCategoryCount(profileCategories.length);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!yearMonth) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-red-600">Mês inválido: {String(ym)}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
      <View className="flex-row items-center gap-6">
        <Pressable
          onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, -1) })}
          hitSlop={12}
        >
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-xl font-semibold capitalize">{yearMonthLabel(yearMonth)}</Text>
        <Pressable
          onPress={() => router.setParams({ ym: shiftYearMonth(yearMonth, 1) })}
          hitSlop={12}
        >
          <Text className="text-2xl">→</Text>
        </Pressable>
      </View>

      <Text className="text-gray-500">
        Perfil: {profileName ?? "carregando…"} · {categoryCount ?? "…"} categorias
      </Text>

      <Link href="/(main)/budget" className="mt-4 text-blue-600">
        Orçamentos
      </Link>
      <Link href="/(main)/profiles" className="text-blue-600">
        Perfis
      </Link>
      <Link href="/(main)/settings" className="text-blue-600">
        Ajustes
      </Link>
    </View>
  );
}
