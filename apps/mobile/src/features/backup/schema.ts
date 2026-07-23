import { z } from "zod";

/**
 * Validates a full-backup JSON file before it's ever inserted into the local
 * DB (see repository.ts `restoreBackupData`). Deliberately NOT the
 * `@noazul/shared` schemas — those model `dueDate` as a full ISO datetime for
 * the future sync backend, while the local DB (and this backup format)
 * always stores it as a plain "YYYY-MM-DD" string (see lib/dates.ts).
 */

const isoDatetime = z.string().datetime({ offset: true });
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected \"YYYY-MM-DD\"");

const backupProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  isDefault: z.boolean(),
  updatedAt: isoDatetime,
});

const backupCategorySchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  updatedAt: isoDatetime,
});

const backupTransactionSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  categoryId: z.string().min(1).nullable(),
  name: z.string().min(1),
  type: z.enum(["INCOME", "EXPENSE"]),
  status: z.enum(["PENDING", "PAID"]),
  amountCents: z.number().int(),
  dueDate: dateOnly,
  paidAt: isoDatetime.nullable(),
  recurrenceId: z.string().min(1).nullable(),
  installmentNo: z.number().int().positive().nullable(),
  installmentOf: z.number().int().positive().nullable(),
  updatedAt: isoDatetime,
});

const backupBudgetSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  categoryId: z.string().min(1),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, "expected \"YYYY-MM\""),
  limitCents: z.number().int(),
  updatedAt: isoDatetime,
});

export const backupDataSchema = z.object({
  version: z.literal(1),
  exportedAt: isoDatetime,
  profiles: z.array(backupProfileSchema),
  categories: z.array(backupCategorySchema),
  transactions: z.array(backupTransactionSchema),
  budgets: z.array(backupBudgetSchema),
});

export type BackupData = z.infer<typeof backupDataSchema>;
