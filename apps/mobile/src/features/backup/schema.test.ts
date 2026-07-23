import { describe, expect, it } from "vitest";

import { backupDataSchema } from "./schema";

function validBackup() {
  return {
    version: 1 as const,
    exportedAt: "2026-07-23T12:00:00.000Z",
    profiles: [{ id: "p1", name: "Casa", isDefault: true, updatedAt: "2026-07-23T12:00:00.000Z" }],
    categories: [
      { id: "c1", profileId: "p1", name: "Mercado", color: "#111111", updatedAt: "2026-07-23T12:00:00.000Z" },
    ],
    transactions: [
      {
        id: "t1",
        profileId: "p1",
        categoryId: "c1",
        name: "Feira",
        type: "EXPENSE" as const,
        status: "PAID" as const,
        amountCents: 5000,
        dueDate: "2026-07-10",
        paidAt: "2026-07-10T12:00:00.000Z",
        recurrenceId: null,
        installmentNo: null,
        installmentOf: null,
        updatedAt: "2026-07-23T12:00:00.000Z",
      },
    ],
    budgets: [
      {
        id: "b1",
        profileId: "p1",
        categoryId: "c1",
        yearMonth: "2026-07",
        limitCents: 100000,
        updatedAt: "2026-07-23T12:00:00.000Z",
      },
    ],
  };
}

describe("backupDataSchema", () => {
  it("accepts a well-formed backup", () => {
    expect(backupDataSchema.safeParse(validBackup()).success).toBe(true);
  });

  it("rejects a wrong version", () => {
    const data = { ...validBackup(), version: 2 };
    expect(backupDataSchema.safeParse(data).success).toBe(false);
  });

  it("rejects a dueDate that isn't a plain YYYY-MM-DD string", () => {
    const data = validBackup();
    data.transactions[0]!.dueDate = "2026-07-10T00:00:00.000Z";
    expect(backupDataSchema.safeParse(data).success).toBe(false);
  });

  it("rejects an invalid transaction type", () => {
    const data = validBackup() as unknown as { transactions: Record<string, unknown>[] };
    data.transactions[0]!.type = "TRANSFER";
    expect(backupDataSchema.safeParse(data).success).toBe(false);
  });

  it("accepts empty arrays (fresh install backup)", () => {
    const data = { version: 1 as const, exportedAt: "2026-07-23T12:00:00.000Z", profiles: [], categories: [], transactions: [], budgets: [] };
    expect(backupDataSchema.safeParse(data).success).toBe(true);
  });

  it("rejects a missing required field", () => {
    const data = validBackup() as unknown as { profiles: Record<string, unknown>[] };
    delete data.profiles[0]!.name;
    expect(backupDataSchema.safeParse(data).success).toBe(false);
  });
});
