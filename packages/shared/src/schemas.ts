import { z } from "zod";

/**
 * Shared Zod schemas mirroring the domain model in noazul-blueprint.md §3.3.
 * Used by both apps/mobile (Drizzle-backed local DB) and apps/web-sync (Prisma-backed sync API).
 */

export const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "yearMonth must be in \"YYYY-MM\" format");

export const uuidSchema = z.string().uuid();

export const txTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export type TxType = z.infer<typeof txTypeSchema>;

export const txStatusSchema = z.enum(["PENDING", "PAID"]);
export type TxStatus = z.infer<typeof txStatusSchema>;

const syncableFields = {
  deletedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
};

export const profileSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(60),
  isDefault: z.boolean(),
  ...syncableFields,
});
export type Profile = z.infer<typeof profileSchema>;

export const categorySchema = z.object({
  id: uuidSchema,
  profileId: uuidSchema,
  name: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex string like #RRGGBB"),
  ...syncableFields,
});
export type Category = z.infer<typeof categorySchema>;

export const transactionSchema = z.object({
  id: uuidSchema,
  profileId: uuidSchema,
  categoryId: uuidSchema.nullable(),
  name: z.string().min(1).max(120),
  type: txTypeSchema,
  status: txStatusSchema,
  // Money is ALWAYS an integer number of cents. Never a float.
  amountCents: z.number().int().nonnegative(),
  dueDate: z.string().datetime(),
  paidAt: z.string().datetime().nullable(),
  recurrenceId: uuidSchema.nullable(),
  installmentNo: z.number().int().positive().nullable(),
  installmentOf: z.number().int().positive().nullable(),
  ...syncableFields,
});
export type Transaction = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  id: uuidSchema,
  profileId: uuidSchema,
  categoryId: uuidSchema,
  yearMonth: yearMonthSchema,
  limitCents: z.number().int().nonnegative(),
  ...syncableFields,
});
export type Budget = z.infer<typeof budgetSchema>;
