import { Alert } from "react-native";

import type { TransactionRow } from "./types";

/**
 * Confirms a delete before it happens (Fase 2, "Exclusão de série com
 * confirmação"). Transactions that belong to a recurring series get a third
 * option to also remove every future occurrence.
 */
export function confirmDeleteTransaction(
  transaction: TransactionRow,
  handlers: { onDeleteOnly: () => void; onDeleteSeries: () => void },
): void {
  if (transaction.recurrenceId) {
    Alert.alert(
      "Excluir lançamento",
      `"${transaction.name}" faz parte de uma série recorrente. O que deseja excluir?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Só este", style: "destructive", onPress: handlers.onDeleteOnly },
        { text: "Este e os futuros", style: "destructive", onPress: handlers.onDeleteSeries },
      ],
    );
    return;
  }

  Alert.alert("Excluir lançamento", `Tem certeza que deseja excluir "${transaction.name}"?`, [
    { text: "Cancelar", style: "cancel" },
    { text: "Excluir", style: "destructive", onPress: handlers.onDeleteOnly },
  ]);
}

/**
 * Asks "só esta / esta e futuras" (calendar-app convention) before saving an
 * edit to an occurrence that belongs to a recurring series. Standalone
 * transactions skip the prompt entirely.
 */
export function confirmEditScope(
  transaction: TransactionRow,
  handlers: { onOnlyThis: () => void; onThisAndFuture: () => void },
): void {
  if (!transaction.recurrenceId) {
    handlers.onOnlyThis();
    return;
  }

  Alert.alert(
    "Salvar alterações",
    `"${transaction.name}" faz parte de uma série recorrente. Aplicar a alteração a:`,
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Só esta", onPress: handlers.onOnlyThis },
      { text: "Esta e futuras", onPress: handlers.onThisAndFuture },
    ],
  );
}
