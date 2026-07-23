import { describe, expect, it } from "vitest";

import { FREE_REMINDER_LIMIT, reminderLimitFor } from "./gate";

describe("reminderLimitFor", () => {
  it("caps free users at FREE_REMINDER_LIMIT", () => {
    expect(reminderLimitFor(false)).toBe(FREE_REMINDER_LIMIT);
  });

  it("gives premium users a much higher limit", () => {
    expect(reminderLimitFor(true)).toBeGreaterThan(FREE_REMINDER_LIMIT);
  });
});
