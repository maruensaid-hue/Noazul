import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { ActionSheetModal } from "../../../src/components/ui/ActionSheetModal";
import { AUTO_BACKUP_INTERVAL_DAYS } from "../../../src/features/backup/autoBackupSchedule";
import {
  useAutoBackupSettings,
  useExportBackup,
  useExportTransactionsCsv,
  usePickBackupFile,
  useRestoreBackup,
  useSetAutoBackupEnabled,
} from "../../../src/features/backup/queries";
import type { BackupData } from "../../../src/features/backup/schema";
import { currentYearMonth, parseYearMonth, yearMonthLabel } from "../../../src/lib/dates";
import { useBillingStore } from "../../../src/stores/billingStore";
import { useProfileStore } from "../../../src/stores/profileStore";

function SettingsRow({
  title,
  subtitle,
  onPress,
  disabled,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="gap-1 border-b border-gray-100 px-4 py-4 dark:border-gray-800"
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      <Text className="text-base text-gray-900 dark:text-gray-50">{title}</Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</Text>
    </Pressable>
  );
}

export default function BackupScreen() {
  const isPremium = useBillingStore((state) => state.isPremium);
  const profileId = useProfileStore((state) => state.activeProfileId);

  const [csvSheetVisible, setCsvSheetVisible] = useState(false);

  const exportCsv = useExportTransactionsCsv(profileId);
  const exportBackup = useExportBackup();
  const pickBackupFile = usePickBackupFile();
  const restoreBackup = useRestoreBackup();
  const autoBackupSettingsQuery = useAutoBackupSettings();
  const setAutoBackupEnabled = useSetAutoBackupEnabled();

  const busy =
    exportCsv.isPending || exportBackup.isPending || pickBackupFile.isPending || restoreBackup.isPending;
  const autoBackupEnabled = autoBackupSettingsQuery.data?.enabled === true;

  if (!isPremium) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text className="text-base text-brand-600">Voltar</Text>
          </Pressable>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Exportar e backup</Text>
          <View style={{ width: 44 }} />
        </View>
        <View className="items-center gap-4 px-6 py-16">
          <Text className="text-center text-gray-500 dark:text-gray-400">
            Exportar seus lançamentos e fazer backup completo é um recurso Premium.
          </Text>
          <Pressable onPress={() => router.push("/paywall")} className="rounded-lg bg-brand-600 px-5 py-3">
            <Text className="font-medium text-white">Conhecer o Premium</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function confirmAndRestore(data: BackupData) {
    Alert.alert(
      "Restaurar backup",
      `Isso vai substituir TODOS os dados atuais do app pelos dados deste backup (gerado em ${new Date(data.exportedAt).toLocaleDateString("pt-BR")}). Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          style: "destructive",
          onPress: () => {
            restoreBackup.mutate(data, {
              onSuccess: () => {
                Alert.alert("Backup restaurado", "Seus dados foram restaurados com sucesso.");
                router.replace("/");
              },
              onError: (error) => Alert.alert("Não foi possível restaurar", error.message),
            });
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14 dark:border-gray-800">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-base text-brand-600">Voltar</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Exportar e backup</Text>
        <View style={{ width: 44 }} />
      </View>

      <SettingsRow
        title="Exportar lançamentos (CSV)"
        subtitle="Gera uma planilha para abrir no Excel/Google Sheets."
        disabled={busy}
        onPress={() => setCsvSheetVisible(true)}
      />

      <SettingsRow
        title="Backup completo (JSON)"
        subtitle="Salva todos os perfis, categorias, lançamentos e orçamentos num arquivo."
        disabled={busy}
        onPress={() => {
          exportBackup.mutate(undefined, {
            onError: (error) => Alert.alert("Não foi possível gerar o backup", error.message),
          });
        }}
      />

      <SettingsRow
        title="Restaurar backup"
        subtitle="Substitui os dados atuais pelos de um arquivo de backup salvo antes."
        disabled={busy}
        onPress={() => {
          pickBackupFile.mutate(undefined, {
            onSuccess: (data) => {
              if (data) confirmAndRestore(data);
            },
            onError: (error) => Alert.alert("Arquivo inválido", error.message),
          });
        }}
      />

      <SettingsRow
        title={`Backup automático — ${autoBackupEnabled ? "Ativado" : "Desativado"}`}
        subtitle={
          autoBackupEnabled
            ? autoBackupSettingsQuery.data?.lastRunAt
              ? `A cada ${AUTO_BACKUP_INTERVAL_DAYS} dias, sozinho · último em ${new Date(autoBackupSettingsQuery.data.lastRunAt).toLocaleDateString("pt-BR")}`
              : `A cada ${AUTO_BACKUP_INTERVAL_DAYS} dias, sozinho · ainda não rodou`
            : `Gera um backup completo sozinho a cada ${AUTO_BACKUP_INTERVAL_DAYS} dias, sem precisar abrir esta tela.`
        }
        disabled={busy || autoBackupSettingsQuery.isLoading}
        onPress={() => setAutoBackupEnabled.mutate(!autoBackupEnabled)}
      />

      <ActionSheetModal
        visible={csvSheetVisible}
        title="Exportar lançamentos de..."
        onClose={() => setCsvSheetVisible(false)}
        options={[
          {
            label: `Este mês (${yearMonthLabel(currentYearMonth())})`,
            onPress: () => {
              exportCsv.mutate(
                { type: "month", yearMonth: currentYearMonth() },
                { onError: (error) => Alert.alert("Não foi possível exportar", error.message) },
              );
            },
          },
          {
            label: `Este ano (${parseYearMonth(currentYearMonth()).year})`,
            onPress: () => {
              exportCsv.mutate(
                { type: "year", year: parseYearMonth(currentYearMonth()).year },
                { onError: (error) => Alert.alert("Não foi possível exportar", error.message) },
              );
            },
          },
          {
            label: "Tudo",
            onPress: () => {
              exportCsv.mutate(
                { type: "all" },
                { onError: (error) => Alert.alert("Não foi possível exportar", error.message) },
              );
            },
          },
        ]}
      />
    </View>
  );
}
