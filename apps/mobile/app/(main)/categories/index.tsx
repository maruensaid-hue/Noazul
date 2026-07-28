import { router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { ActionSheetModal } from "../../../src/components/ui/ActionSheetModal";
import { CategoryEditModal } from "../../../src/components/ui/CategoryEditModal";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { LoadingState } from "../../../src/components/ui/LoadingState";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
  useUpdateCategoryColor,
} from "../../../src/features/categories/queries";
import type { CategoryRow } from "../../../src/features/categories/repository";
import { useProfileStore } from "../../../src/stores/profileStore";

export default function CategoriesScreen() {
  const profileId = useProfileStore((state) => state.activeProfileId);
  const categoriesQuery = useCategories(profileId);
  const createCategory = useCreateCategory(profileId);
  const renameCategory = useRenameCategory(profileId);
  const updateColor = useUpdateCategoryColor(profileId);
  const deleteCategory = useDeleteCategory(profileId);

  const [menuCategory, setMenuCategory] = useState<CategoryRow | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [creating, setCreating] = useState(false);

  if (categoriesQuery.isLoading) {
    return <LoadingState />;
  }
  if (categoriesQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar as categorias."
        onRetry={() => categoriesQuery.refetch()}
      />
    );
  }

  const categories = categoriesQuery.data ?? [];

  function handleSave(name: string, color: string) {
    const onError = (error: Error) =>
      Alert.alert(
        "Não foi possível salvar",
        error.message.includes("UNIQUE") ? "Já existe uma categoria com esse nome." : error.message,
      );

    if (editingCategory) {
      renameCategory.mutate({ id: editingCategory.id, name }, { onError });
      if (color !== editingCategory.color) {
        updateColor.mutate({ id: editingCategory.id, color }, { onError });
      }
    } else {
      createCategory.mutate({ name, color }, { onError });
    }
  }

  const menuOptions = menuCategory
    ? [
        { label: "Editar", onPress: () => setEditingCategory(menuCategory) },
        {
          label: "Excluir",
          destructive: true,
          onPress: () => {
            Alert.alert(
              "Excluir categoria",
              `Excluir "${menuCategory.name}"? Os lançamentos já feitos com ela continuam existindo, apenas sem categoria.`,
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Excluir",
                  style: "destructive",
                  onPress: () => deleteCategory.mutate(menuCategory.id),
                },
              ],
            );
          },
        },
      ]
    : [];

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-base text-brand-600">Voltar</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Categorias</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setMenuCategory(item)}
            className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800"
          >
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <Text className="flex-1 text-base text-gray-900 dark:text-gray-50">{item.name}</Text>
            <Text className="text-gray-400 dark:text-gray-500">›</Text>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState message="Nenhuma categoria ainda." />}
      />

      <Pressable
        onPress={() => setCreating(true)}
        className="mx-4 my-4 items-center rounded-lg border border-brand-200 bg-brand-50 py-3 dark:border-brand-800 dark:bg-brand-900/30"
      >
        <Text className="text-sm font-medium text-brand-700 dark:text-brand-300">
          + Nova categoria
        </Text>
      </Pressable>

      <ActionSheetModal
        visible={menuCategory !== null}
        title={menuCategory?.name}
        options={menuOptions}
        onClose={() => setMenuCategory(null)}
      />

      <CategoryEditModal
        visible={editingCategory !== null}
        title="Editar categoria"
        initialName={editingCategory?.name}
        initialColor={editingCategory?.color}
        onSave={handleSave}
        onClose={() => setEditingCategory(null)}
      />

      <CategoryEditModal
        visible={creating}
        title="Nova categoria"
        onSave={handleSave}
        onClose={() => setCreating(false)}
      />
    </View>
  );
}
