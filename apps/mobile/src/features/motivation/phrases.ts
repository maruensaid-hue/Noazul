/**
 * Motivational one-liners keyed to "saldo seguro" (safeBalanceCents), same 7
 * bands as the reference spreadsheet's B8 formula — tone softened for a
 * general audience (no slang/crude jokes).
 */
export function motivationalPhrase(safeBalanceCents: number): string {
  if (safeBalanceCents < -50000) {
    return "O saldo está bem apertado esse mês. Que tal um chá quentinho e repensar os gastos com calma?";
  }
  if (safeBalanceCents <= -10100) {
    return "Nesse ritmo as contas não vão fechar. Hora de dar um freio nos gastos!";
  }
  if (safeBalanceCents < 0) {
    return "O saldo ficou negativo, mas ainda dá pra ajustar até o fim do mês!";
  }
  if (safeBalanceCents === 0) {
    return "Saldo zerado! Equilíbrio perfeito… ou sorte grande?";
  }
  if (safeBalanceCents <= 9900) {
    return "Começando a guardar uma gordurinha no orçamento. Parabéns!";
  }
  if (safeBalanceCents <= 50000) {
    return "Olha só, o próximo Warren Buffett! Continue assim que o caminho está certo.";
  }
  return "Mandou muito bem! Que tal guardar essa sobra para não gastar à toa?";
}

export type MotivationalTone = "danger" | "warning" | "neutral" | "success";

/** Accent tone for the banner background, same bands as `motivationalPhrase`. */
export function motivationalTone(safeBalanceCents: number): MotivationalTone {
  if (safeBalanceCents <= -10100) return "danger";
  if (safeBalanceCents < 0) return "warning";
  if (safeBalanceCents === 0) return "neutral";
  return "success";
}
