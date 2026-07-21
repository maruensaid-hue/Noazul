import { useState } from "react";
import { Modal, Pressable, Text, TextInput } from "react-native";

import { brlToCents, centsToInputString } from "../../lib/money";

interface BudgetLimitModalProps {
  visible: boolean;
  categoryName: string;
  initialLimitCents: number | null;
  onSave: (limitCents: number) => void;
  onRemove?: () => void;
  onClose: () => void;
}

export function BudgetLimitModal({
  visible,
  categoryName,
  initialLimitCents,
  onSave,
  onRemove,
  onClose,
}: BudgetLimitModalProps) {
  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setAmountInput(initialLimitCents !== null ? centsToInputString(initialLimitCents) : "");
    setError(null);
  }

  function handleSave() {
    try {
      const cents = brlToCents(amountInput);
      if (cents <= 0) {
        setError("Informe um valor maior que zero");
        return;
      }
      onSave(cents);
      onClose();
    } catch {
      setError("Informe um valor válido, ex: 300,00");
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={handleOpen}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="gap-4 rounded-t-2xl bg-white px-4 pb-8 pt-5 dark:bg-gray-800">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Orçamento — {categoryName}
          </Text>
          <TextInput
            value={amountInput}
            onChangeText={setAmountInput}
            placeholder="0,00"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            autoFocus
            className="rounded-lg border border-gray-200 px-3 py-3 text-base text-gray-900 dark:border-gray-700 dark:text-gray-50"
          />
          {error ? <Text className="text-sm text-danger-600">{error}</Text> : null}
          <Pressable onPress={handleSave} className="items-center rounded-lg bg-brand-600 py-3.5">
            <Text className="text-base font-semibold text-white">Salvar</Text>
          </Pressable>
          {onRemove ? (
            <Pressable
              onPress={() => {
                onClose();
                onRemove();
              }}
              className="items-center py-2"
            >
              <Text className="text-base text-danger-600">Remover orçamento</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
