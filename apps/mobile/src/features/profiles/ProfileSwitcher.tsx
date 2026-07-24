import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text } from "react-native";

import { useProfiles, useSwitchActiveProfile } from "./queries";

interface ProfileSwitcherProps {
  /** "light" reads on dark/brand backgrounds (e.g. the month header) — defaults to the neutral gray-on-white styling used elsewhere. */
  variant?: "light" | "dark";
}

/** Compact header trigger showing the active profile; opens a quick-switch list. */
export function ProfileSwitcher({ variant = "dark" }: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  const profilesQuery = useProfiles();
  const switchProfile = useSwitchActiveProfile();

  const activeProfile = profilesQuery.data?.find((profile) => profile.isDefault);
  const isLight = variant === "light";

  return (
    <>
      <Pressable onPress={() => setOpen(true)} className="flex-row items-center gap-1 px-4 py-2" hitSlop={8}>
        <Text
          className={
            isLight
              ? "text-sm font-medium text-white"
              : "text-sm font-medium text-gray-500 dark:text-gray-400"
          }
        >
          {activeProfile?.name ?? "Perfil"}
        </Text>
        <Text className={isLight ? "text-xs text-white/70" : "text-xs text-gray-400"}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="rounded-t-2xl bg-white pb-8 pt-2 dark:bg-gray-800">
            <Text className="px-4 py-2 text-center text-xs uppercase tracking-wide text-gray-400">
              Trocar de perfil
            </Text>
            {(profilesQuery.data ?? []).map((profile) => (
              <Pressable
                key={profile.id}
                onPress={() => {
                  setOpen(false);
                  if (!profile.isDefault) switchProfile.mutate(profile.id);
                }}
                className="flex-row items-center justify-between border-t border-gray-100 px-4 py-4 dark:border-gray-700"
              >
                <Text className="text-base text-gray-900 dark:text-gray-50">{profile.name}</Text>
                {profile.isDefault ? (
                  <Text className="text-sm font-medium text-brand-600">Ativo</Text>
                ) : null}
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setOpen(false);
                router.push("/(main)/profiles");
              }}
              className="items-center border-t border-gray-100 px-4 py-4 dark:border-gray-700"
            >
              <Text className="text-base text-brand-600">Gerenciar perfis</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
