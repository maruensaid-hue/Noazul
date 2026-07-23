import { Directory, File, Paths } from "expo-file-system";

const AUTO_BACKUP_DIR_NAME = "auto-backups";
const AUTO_BACKUP_FILE_NAME = "latest.json";

function autoBackupDirectory(): Directory {
  const dir = new Directory(Paths.document, AUTO_BACKUP_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Overwrites the single auto-backup file in app-private storage — no retention of older runs. */
export function writeAutoBackupFile(content: string): string {
  const file = new File(autoBackupDirectory(), AUTO_BACKUP_FILE_NAME);
  if (file.exists) file.delete();
  file.write(content);
  return file.uri;
}
