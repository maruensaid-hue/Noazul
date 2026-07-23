import { useState } from "react";
import { Modal, Pressable, Text, TextInput } from "react-native";

interface TextPromptModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  saveLabel?: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export function TextPromptModal({
  visible,
  title,
  placeholder,
  initialValue = "",
  saveLabel = "Salvar",
  onSave,
  onClose,
}: TextPromptModalProps) {
  const [value, setValue] = useState(initialValue);

  function handleShow() {
    setValue(initialValue);
  }

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
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
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            className="rounded-lg border border-gray-200 px-3 py-3 text-base text-gray-900 dark:border-gray-700 dark:text-gray-50"
          />
          <Pressable onPress={handleSave} className="items-center rounded-lg bg-brand-600 py-3.5">
            <Text className="text-base font-semibold text-white">{saveLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
