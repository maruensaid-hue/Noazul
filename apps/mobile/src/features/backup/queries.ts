import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getActiveProfileId } from "../profiles/repository";
import { pickJsonFileText, shareTextFile } from "../../services/fileExport";
import { useProfileStore } from "../../stores/profileStore";
import {
  buildBackupData,
  exportTransactionsCsv,
  getAutoBackupSettings,
  restoreBackupData,
  setAutoBackupEnabled,
  type CsvScope,
} from "./repository";
import { backupDataSchema, type BackupData } from "./schema";

const autoBackupSettingsKey = ["app-settings", "auto-backup"] as const;

export function useAutoBackupSettings() {
  return useQuery({
    queryKey: autoBackupSettingsKey,
    queryFn: getAutoBackupSettings,
  });
}

export function useSetAutoBackupEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => setAutoBackupEnabled(enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: autoBackupSettingsKey }),
  });
}

function csvFileName(scope: CsvScope): string {
  const today = new Date().toISOString().slice(0, 10);
  const suffix = scope.type === "month" ? scope.yearMonth : scope.type === "year" ? String(scope.year) : "tudo";
  return `noazul-lancamentos-${suffix}-${today}.csv`;
}

export function useExportTransactionsCsv(profileId: string | null) {
  return useMutation({
    mutationFn: async (scope: CsvScope) => {
      const csv = await exportTransactionsCsv(profileId as string, scope);
      await shareTextFile(csvFileName(scope), csv, "text/csv");
    },
  });
}

export function useExportBackup() {
  return useMutation({
    mutationFn: async () => {
      const data = await buildBackupData();
      const fileName = `noazul-backup-${data.exportedAt.slice(0, 10)}.json`;
      await shareTextFile(fileName, JSON.stringify(data, null, 2), "application/json");
    },
  });
}

/** Picks a backup file and validates it, without touching the DB yet — the caller confirms with the user before calling useRestoreBackup. */
export function usePickBackupFile() {
  return useMutation({
    mutationFn: async (): Promise<BackupData | null> => {
      const text = await pickJsonFileText();
      if (text === null) return null;

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(text);
      } catch {
        throw new Error("O arquivo selecionado não é um backup válido do NoAzul.");
      }
      const result = backupDataSchema.safeParse(parsedJson);
      if (!result.success) {
        throw new Error("O arquivo selecionado não é um backup válido do NoAzul.");
      }
      return result.data;
    },
  });
}

/** Actually applies the restore — call only after the user explicitly confirmed the overwrite. */
export function useRestoreBackup() {
  const queryClient = useQueryClient();
  const setActiveProfileId = useProfileStore((state) => state.setActiveProfileId);

  return useMutation({
    mutationFn: async (data: BackupData) => {
      await restoreBackupData(data);
      queryClient.clear();
      const profileId = await getActiveProfileId();
      if (profileId) setActiveProfileId(profileId);
    },
  });
}
