import { Modal, Pressable, Text, View } from "react-native";

import type { CategoryRow } from "../../features/categories/repository";

interface CategoryPickerModalProps {
  visible: boolean;
  categories: CategoryRow[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
  onClose: () => void;
}

export function CategoryPickerModal({
  visible,
  categories,
  selectedCategoryId,
  onSelect,
  onClose,
}: CategoryPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="max-h-[70%] rounded-t-2xl bg-white pb-8 pt-2 dark:bg-gray-800">
          <Text className="px-4 py-2 text-center text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Categoria
          </Text>
          <Pressable
            onPress={() => {
              onClose();
              onSelect(null);
            }}
            className="flex-row items-center gap-3 border-t border-gray-100 px-4 py-4 dark:border-gray-700"
          >
            <View className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            <Text
              className={
                selectedCategoryId === null
                  ? "font-semibold text-gray-900 dark:text-gray-50"
                  : "text-gray-900 dark:text-gray-50"
              }
            >
              Sem categoria
            </Text>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => {
                onClose();
                onSelect(category.id);
              }}
              className="flex-row items-center gap-3 border-t border-gray-100 px-4 py-4 dark:border-gray-700"
            >
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <Text
                className={
                  selectedCategoryId === category.id
                    ? "font-semibold text-gray-900 dark:text-gray-50"
                    : "text-gray-900 dark:text-gray-50"
                }
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
