import { Modal, Pressable, Text } from "react-native";

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetModalProps {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export function ActionSheetModal({ visible, title, options, onClose }: ActionSheetModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-2xl bg-white pb-8 pt-2 dark:bg-gray-800">
          {title ? (
            <Text className="px-4 py-2 text-center text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {title}
            </Text>
          ) : null}
          {options.map((option) => (
            <Pressable
              key={option.label}
              onPress={() => {
                onClose();
                option.onPress();
              }}
              className="border-t border-gray-100 px-4 py-4 dark:border-gray-700"
            >
              <Text
                className={
                  option.destructive
                    ? "text-center text-base text-danger-600"
                    : "text-center text-base text-gray-900 dark:text-gray-50"
                }
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
