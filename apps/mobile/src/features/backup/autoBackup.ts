import { nowIso } from "../../lib/dates";
import { writeAutoBackupFile } from "../../services/autoBackupStorage";
import { shouldRunAutoBackup } from "./autoBackupSchedule";
import { buildBackupData, getAutoBackupSettings, recordAutoBackupRun } from "./repository";

/**
 * Checked once whenever the app opens (see useAutoBackup.ts) — if enabled
 * and due, silently snapshots all local data to app-private storage. No UI,
 * no confirmation: this is the "sozinho, sem precisar abrir a tela" backup,
 * separate from (and in addition to) the manual "Backup completo" share
 * action in app/(main)/backup.
 */
export async function runAutoBackupIfDue(): Promise<void> {
  const settings = await getAutoBackupSettings();
  if (!settings.enabled) return;
  if (!shouldRunAutoBackup(settings.lastRunAt, new Date())) return;

  const data = await buildBackupData();
  writeAutoBackupFile(JSON.stringify(data));
  await recordAutoBackupRun(nowIso());
}
