import { router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { ActionSheetModal } from "../../../src/components/ui/ActionSheetModal";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import { TextPromptModal } from "../../../src/components/ui/TextPromptModal";
import { canCreateProfile } from "../../../src/features/profiles/gate";
import {
  useCreateAndActivateProfile,
  useDeleteProfile,
  useProfiles,
  useRenameProfile,
  useSwitchActiveProfile,
} from "../../../src/features/profiles/queries";
import type { ProfileRow } from "../../../src/features/profiles/repository";
import { useBillingStore } from "../../../src/stores/billingStore";

export default function ProfilesScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);
  const profilesQuery = useProfiles();
  const switchProfile = useSwitchActiveProfile();
  const renameProfile = useRenameProfile();
  const deleteProfile = useDeleteProfile();
  const createProfile = useCreateAndActivateProfile();

  const [menuProfile, setMenuProfile] = useState<ProfileRow | null>(null);
  const [renamingProfile, setRenamingProfile] = useState<ProfileRow | null>(null);
  const [creating, setCreating] = useState(false);

  if (profilesQuery.isLoading) {
    return <LoadingState />;
  }
  if (profilesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar os perfis."
        onRetry={() => profilesQuery.refetch()}
      />
    );
  }

  const profiles = profilesQuery.data ?? [];
  const canDelete = profiles.length > 1;

  const menuOptions = menuProfile
    ? [
        ...(menuProfile.isDefault
          ? []
          : [{ label: "Trocar para este perfil", onPress: () => switchProfile.mutate(menuProfile.id) }]),
        { label: "Renomear", onPress: () => setRenamingProfile(menuProfile) },
        ...(canDelete
          ? [
              {
                label: "Excluir",
                destructive: true,
                onPress: () => {
                  Alert.alert(
                    "Excluir perfil",
                    `Excluir "${menuProfile.name}"? Todos os lançamentos, categorias e orçamentos deste perfil serão apagados.`,
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Excluir",
                        style: "destructive",
                        onPress: () => deleteProfile.mutate(menuProfile.id),
                      },
                    ],
                  );
                },
              },
            ]
          : []),
      ]
    : [];

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-base text-brand-600">Voltar</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Perfis</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => (item.isDefault ? setMenuProfile(item) : switchProfile.mutate(item.id))}
            onLongPress={() => setMenuProfile(item)}
            className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800"
          >
            <Text className="text-base text-gray-900 dark:text-gray-50">{item.name}</Text>
            {item.isDefault ? (
              <Text className="text-sm font-medium text-brand-600">Ativo</Text>
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState message="Nenhum perfil encontrado." />}
      />

      <Pressable
        onPress={() => {
          if (canCreateProfile(isPremium, profiles.length)) {
            setCreating(true);
          } else {
            router.push("/paywall");
          }
        }}
        className="mx-4 my-4 items-center rounded-lg border border-brand-200 bg-brand-50 py-3 dark:border-brand-800 dark:bg-brand-900/30"
      >
        <Text className="text-sm font-medium text-brand-700 dark:text-brand-300">
          + Novo perfil
        </Text>
      </Pressable>

      <ActionSheetModal
        visible={menuProfile !== null}
        title={menuProfile?.name}
        options={menuOptions}
        onClose={() => setMenuProfile(null)}
      />

      <TextPromptModal
        visible={renamingProfile !== null}
        title="Renomear perfil"
        initialValue={renamingProfile?.name ?? ""}
        onSave={(name) => {
          if (renamingProfile) renameProfile.mutate({ id: renamingProfile.id, name });
        }}
        onClose={() => setRenamingProfile(null)}
      />

      <TextPromptModal
        visible={creating}
        title="Novo perfil"
        placeholder="Ex: Firma, MEI"
        saveLabel="Criar"
        onSave={(name) => createProfile.mutate(name)}
        onClose={() => setCreating(false)}
      />
    </View>
  );
}
