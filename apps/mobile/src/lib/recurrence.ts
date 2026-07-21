import { shiftDateByMonths } from "./dates";

/** How many months ahead a fixed monthly recurrence materializes (noazul-blueprint.md §4 Fase 2). */
export const RECURRENCE_MONTHS_AHEAD = 12;

export const MIN_INSTALLMENTS = 2;
export const MAX_INSTALLMENTS = 48;

export interface RecurrenceOccurrence {
  dueDate: string;
  name: string;
  installmentNo: number | null;
  installmentOf: number | null;
}

/**
 * "Aluguel todo dia 10": materializes `monthsAhead` monthly occurrences
 * starting at `startDueDate` (inclusive), keeping the same name. Reuses
 * `shiftDateByMonths` so a start day near month-end clamps correctly
 * (e.g. "2026-01-31" -> "2026-02-28").
 */
export function generateFixedRecurrencePlan(
  name: string,
  startDueDate: string,
  monthsAhead: number = RECURRENCE_MONTHS_AHEAD,
): RecurrenceOccurrence[] {
  if (!Number.isInteger(monthsAhead) || monthsAhead < 1) {
    throw new RangeError(`monthsAhead must be an integer >= 1, got ${monthsAhead}`);
  }
  return Array.from({ length: monthsAhead }, (_, index) => ({
    dueDate: shiftDateByMonths(startDueDate, index),
    name,
    installmentNo: null,
    installmentOf: null,
  }));
}

/**
 * "Notebook em 10x": materializes exactly `installmentOf` monthly
 * installments starting at `startDueDate`, each named "<name> (n/N)".
 */
export function generateInstallmentPlan(
  name: string,
  startDueDate: string,
  installmentOf: number,
): RecurrenceOccurrence[] {
  if (!Number.isInteger(installmentOf) || installmentOf < MIN_INSTALLMENTS) {
    throw new RangeError(
      `installmentOf must be an integer >= ${MIN_INSTALLMENTS}, got ${installmentOf}`,
    );
  }
  if (installmentOf > MAX_INSTALLMENTS) {
    throw new RangeError(
      `installmentOf must be an integer <= ${MAX_INSTALLMENTS}, got ${installmentOf}`,
    );
  }
  return Array.from({ length: installmentOf }, (_, index) => {
    const installmentNo = index + 1;
    return {
      dueDate: shiftDateByMonths(startDueDate, index),
      name: `${name} (${installmentNo}/${installmentOf})`,
      installmentNo,
      installmentOf,
    };
  });
}
