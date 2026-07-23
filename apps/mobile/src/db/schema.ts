import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Local SQLite schema (Drizzle). Mirrors the sync backend's Prisma schema in
 * noazul-blueprint.md §3.3. Money is always stored as an integer number of cents.
 * `updatedAt` + `deletedAt` (soft delete) exist on every syncable table for the
 * future last-write-wins sync strategy (Fase 6).
 */

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  deletedAt: text("deleted_at"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    deletedAt: text("deleted_at"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("categories_profile_id_name_unique").on(table.profileId, table.name),
  ],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    type: text("type", { enum: ["INCOME", "EXPENSE"] }).notNull(),
    status: text("status", { enum: ["PENDING", "PAID"] })
      .notNull()
      .default("PENDING"),
    amountCents: integer("amount_cents").notNull(),
    dueDate: text("due_date").notNull(),
    paidAt: text("paid_at"),
    recurrenceId: text("recurrence_id"),
    installmentNo: integer("installment_no"),
    installmentOf: integer("installment_of"),
    deletedAt: text("deleted_at"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("transactions_profile_id_due_date_idx").on(table.profileId, table.dueDate),
    index("transactions_recurrence_id_idx").on(table.recurrenceId),
  ],
);

/** Singleton row (id always "singleton") for device-local app preferences — not per-profile, not synced. */
export const appSettings = sqliteTable("app_settings", {
  id: text("id").primaryKey(),
  paymentRemindersEnabled: integer("payment_reminders_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const budgets = sqliteTable(
  "budgets",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    yearMonth: text("year_month").notNull(),
    limitCents: integer("limit_cents").notNull(),
    deletedAt: text("deleted_at"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("budgets_profile_category_month_unique").on(
      table.profileId,
      table.categoryId,
      table.yearMonth,
    ),
  ],
);
