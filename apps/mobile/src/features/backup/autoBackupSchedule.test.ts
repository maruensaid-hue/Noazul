import { describe, expect, it } from "vitest";

import { shouldRunAutoBackup } from "./autoBackupSchedule";

describe("shouldRunAutoBackup", () => {
  it("is due when it has never run before", () => {
    expect(shouldRunAutoBackup(null, new Date("2026-07-23T12:00:00.000Z"))).toBe(true);
  });

  it("is not due before the interval elapses", () => {
    const lastRunAt = "2026-07-20T12:00:00.000Z";
    const now = new Date("2026-07-23T12:00:00.000Z"); // 3 days later, default interval is 7
    expect(shouldRunAutoBackup(lastRunAt, now)).toBe(false);
  });

  it("is due once the interval has fully elapsed", () => {
    const lastRunAt = "2026-07-16T12:00:00.000Z";
    const now = new Date("2026-07-23T12:00:00.000Z"); // exactly 7 days later
    expect(shouldRunAutoBackup(lastRunAt, now)).toBe(true);
  });

  it("respects a custom interval", () => {
    const lastRunAt = "2026-07-22T12:00:00.000Z";
    const now = new Date("2026-07-23T12:00:00.000Z"); // 1 day later
    expect(shouldRunAutoBackup(lastRunAt, now, 1)).toBe(true);
    expect(shouldRunAutoBackup(lastRunAt, now, 2)).toBe(false);
  });
});
