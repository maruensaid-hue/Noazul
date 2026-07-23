import { describe, expect, it } from "vitest";

import { canCreateProfile, FREE_PROFILE_LIMIT } from "./gate";

describe("canCreateProfile", () => {
  it("allows the first profile on free", () => {
    expect(canCreateProfile(false, 0)).toBe(true);
  });

  it("blocks a second profile on free", () => {
    expect(canCreateProfile(false, FREE_PROFILE_LIMIT)).toBe(false);
    expect(canCreateProfile(false, FREE_PROFILE_LIMIT + 3)).toBe(false);
  });

  it("never blocks premium, regardless of count", () => {
    expect(canCreateProfile(true, 0)).toBe(true);
    expect(canCreateProfile(true, 50)).toBe(true);
  });
});
