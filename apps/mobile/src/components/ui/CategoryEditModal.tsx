import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

const COLOR_PALETTE = [
  "#6366F1",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#22C55E",
  "#6B7280",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
];

interface CategoryEditModalProps {
  visible: boolean;
  title: string;
  initialName?: string;
  initialColor?: string;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}

export function CategoryEditModal({
  visible,
  title,
  initialName = "",
  initialColor,
  onSave,
  onClose,
}: CategoryEditModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]!);

  function handleShow() {
    setName(initialName);
    setColor(initialColor ?? COLOR_PALETTE[0]!);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={handleShow}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="gap-4 rounded-t-2xl bg-white px-4 pb-8 pt-5 dark:bg-gray-800">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Cartão de Crédito"
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            className="rounded-lg border border-gray-200 px-3 py-3 text-base text-gray-900 dark:border-gray-700 dark:text-gray-50"
          />
          <View className="flex-row flex-wrap gap-3">
            {COLOR_PALETTE.map((swatch) => (
              <Pressable
                key={swatch}
                onPress={() => setColor(swatch)}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{
                  backgroundColor: swatch,
                  borderWidth: color === swatch ? 3 : 0,
                  borderColor: "#111827",
                }}
              />
            ))}
          </View>
          <Pressable onPress={handleSave} className="items-center rounded-lg bg-brand-600 py-3.5">
            <Text className="text-base font-semibold text-white">Salvar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
