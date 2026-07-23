import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import { newId } from "../lib/id";

const RECEIPTS_DIR_NAME = "receipts";

function receiptsDirectory(): Directory {
  const dir = new Directory(Paths.document, RECEIPTS_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Copies a picker/camera temp file into the app's persistent storage so it survives past the OS clearing caches. */
async function persistPickedAsset(sourceUri: string): Promise<string> {
  const destination = new File(receiptsDirectory(), `${newId()}.jpg`);
  await new File(sourceUri).copy(destination);
  return destination.uri;
}

export type ReceiptSource = "camera" | "library";

/**
 * Requests the relevant OS permission, launches the picker, and copies the
 * result into permanent storage. Returns null if permission was denied or
 * the user canceled — never throws for those expected paths.
 */
export async function pickReceiptPhoto(source: ReceiptSource): Promise<string | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });

  if (result.canceled || result.assets.length === 0) return null;
  return persistPickedAsset(result.assets[0]!.uri);
}

/** Deletes a previously persisted receipt photo — no-op if it's already gone. */
export function deleteReceiptPhoto(uri: string): void {
  const file = new File(uri);
  if (file.exists) file.delete();
}
