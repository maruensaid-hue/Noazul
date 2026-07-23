import { describe, expect, it } from "vitest";

import { annualSavingsPercent } from "./planPresentation";

describe("annualSavingsPercent", () => {
  it("computes the whole-percent savings vs. paying monthly all year", () => {
    // R$9,90/mês x 12 = R$118,80; anual R$78,90 -> saves ~33.6%
    expect(annualSavingsPercent(9.9, 78.9)).toBe(34);
  });

  it("returns null when the annual plan doesn't actually save money", () => {
    expect(annualSavingsPercent(9.9, 150)).toBeNull();
  });

  it("returns null when there's no monthly price to compare against", () => {
    expect(annualSavingsPercent(0, 78.9)).toBeNull();
  });
});
