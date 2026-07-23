import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Writes `content` to a file in the app's cache dir and opens the OS share
 * sheet on it — the user picks where it goes (Drive, e-mail, WhatsApp, "Salvar
 * em Arquivos", etc). Used for both the CSV export and the full JSON backup.
 */
export async function shareTextFile(fileName: string, content: string, mimeType: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.write(content);
  await shareFileAt(file.uri, fileName, mimeType);
}

/**
 * Renames/copies a file the OS handed back with an opaque generated name
 * (e.g. expo-print's PDF output) to `fileName`, then opens the share sheet
 * on it. Used for the PDF report export.
 */
export async function shareGeneratedFile(sourceUri: string, fileName: string, mimeType: string): Promise<void> {
  const destination = new File(Paths.cache, fileName);
  if (destination.exists) destination.delete();
  await new File(sourceUri).copy(destination);
  await shareFileAt(destination.uri, fileName, mimeType);
}

async function shareFileAt(uri: string, dialogTitle: string, mimeType: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Compartilhamento não está disponível neste dispositivo.");
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle });
}

/**
 * Opens the system file picker for a single JSON file and returns its text
 * content, or null if the user cancels. Used by the "Restaurar backup" flow.
 */
export async function pickJsonFileText(): Promise<string | null> {
  const picked = await File.pickFileAsync({ mimeTypes: "application/json" });
  if (picked.canceled) return null;
  return picked.result.text();
}
