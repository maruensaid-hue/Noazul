import { z } from "zod";

import { isValidDateString } from "../../lib/dates";

export const txTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export type TxType = z.infer<typeof txTypeSchema>;

export const txStatusSchema = z.enum(["PENDING", "PAID"]);
export type TxStatus = z.infer<typeof txStatusSchema>;

/** Input accepted by createTransaction/updateTransaction. dueDate is "YYYY-MM-DD". */
export const transactionInputSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(120),
  type: txTypeSchema,
  status: txStatusSchema,
  amountCents: z.number().int().positive("Informe um valor maior que zero"),
  dueDate: z.string().refine(isValidDateString, "Data inválida"),
  categoryId: z.string().uuid().nullable(),
});
export type TransactionInput = z.infer<typeof transactionInputSchema>;

export interface TransactionRow {
  id: string;
  profileId: string;
  categoryId: string | null;
  name: string;
  type: TxType;
  status: TxStatus;
  amountCents: number;
  dueDate: string;
  paidAt: string | null;
  recurrenceId: string | null;
  installmentNo: number | null;
  installmentOf: number | null;
}
