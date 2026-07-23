import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";

import { deleteReceiptPhoto, pickReceiptPhoto } from "../../services/receipts";
import { ActionSheetModal } from "./ActionSheetModal";

interface ReceiptFieldProps {
  receiptUri: string | null;
  canUseReceipts: boolean;
  onChange: (uri: string | null) => void;
}

export function ReceiptField({ receiptUri, canUseReceipts, onChange }: ReceiptFieldProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);

  async function handlePick(source: "camera" | "library") {
    const uri = await pickReceiptPhoto(source);
    if (!uri) return;
    if (receiptUri) deleteReceiptPhoto(receiptUri);
    onChange(uri);
  }

  if (!canUseReceipts) {
    return (
      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Comprovante</Text>
        <Pressable
          onPress={() => router.push("/paywall")}
          className="flex-row items-center justify-between rounded-lg border border-gray-200 px-3 py-3 dark:border-gray-700"
        >
          <Text className="text-sm text-gray-400 dark:text-gray-500">Anexar foto do comprovante</Text>
          <Text className="text-sm font-medium text-brand-600">Premium</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Comprovante</Text>

      {receiptUri ? (
        <View className="gap-2">
          <Pressable onPress={() => setViewerVisible(true)}>
            <Image source={{ uri: receiptUri }} className="h-40 w-full rounded-lg" resizeMode="cover" />
          </Pressable>
          <View className="flex-row gap-4">
            <Pressable onPress={() => setPickerVisible(true)}>
              <Text className="text-sm text-brand-600">Trocar foto</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                deleteReceiptPhoto(receiptUri);
                onChange(null);
              }}
            >
              <Text className="text-sm text-danger-600">Remover foto</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setPickerVisible(true)}
          className="items-center rounded-lg border border-dashed border-gray-300 py-4 dark:border-gray-600"
        >
          <Text className="text-sm text-brand-600">Adicionar foto</Text>
        </Pressable>
      )}

      <ActionSheetModal
        visible={pickerVisible}
        title="Comprovante"
        onClose={() => setPickerVisible(false)}
        options={[
          {
            label: "Tirar foto",
            onPress: () => {
              void handlePick("camera").catch(() =>
                Alert.alert("Não foi possível abrir a câmera", "Tente novamente."),
              );
            },
          },
          {
            label: "Escolher da galeria",
            onPress: () => {
              void handlePick("library").catch(() =>
                Alert.alert("Não foi possível abrir a galeria", "Tente novamente."),
              );
            },
          },
        ]}
      />

      <Modal visible={viewerVisible} animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black"
          onPress={() => setViewerVisible(false)}
        >
          {receiptUri ? (
            <Image source={{ uri: receiptUri }} className="h-full w-full" resizeMode="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}
