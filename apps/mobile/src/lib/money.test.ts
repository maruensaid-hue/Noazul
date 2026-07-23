import { describe, expect, it } from "vitest";

import { brlToCents, centsToBRL, centsToInputString, sumCents } from "./money";

// Intl.NumberFormat("pt-BR", { style: "currency" }) separates the symbol from
// the amount with a non-breaking space (U+00A0), not a regular space.
const NBSP = " ";

describe("centsToBRL", () => {
  it("formats positive cents as BRL", () => {
    expect(centsToBRL(123456)).toBe(`R$${NBSP}1.234,56`);
  });

  it("formats zero", () => {
    expect(centsToBRL(0)).toBe(`R$${NBSP}0,00`);
  });

  it("formats negative cents", () => {
    expect(centsToBRL(-500)).toBe(`-R$${NBSP}5,00`);
  });

  it("throws on non-integer input", () => {
    expect(() => centsToBRL(10.5)).toThrow(TypeError);
  });
});

describe("brlToCents", () => {
  it("parses pt-BR grouped input", () => {
    expect(brlToCents("1.234,56")).toBe(123456);
  });

  it("parses comma-decimal input without grouping", () => {
    expect(brlToCents("1234,56")).toBe(123456);
  });

  it("parses dot-decimal input", () => {
    expect(brlToCents("1234.56")).toBe(123456);
  });

  it("parses integer-only input", () => {
    expect(brlToCents("1234")).toBe(123400);
  });

  it("parses a currency-prefixed string", () => {
    expect(brlToCents("R$ 1.234,56")).toBe(123456);
  });

  it("parses negative values", () => {
    expect(brlToCents("-50,00")).toBe(-5000);
  });

  it("round-trips through centsToBRL", () => {
    expect(brlToCents(centsToBRL(999901))).toBe(999901);
  });

  it("throws on empty input", () => {
    expect(() => brlToCents("")).toThrow(TypeError);
  });

  it("throws on unparseable input", () => {
    expect(() => brlToCents("abc")).toThrow(TypeError);
  });
});

describe("sumCents", () => {
  it("sums integer cents exactly, no float drift", () => {
    const amounts = Array.from({ length: 1000 }, () => 10);
    expect(sumCents(amounts)).toBe(10000);
  });

  it("sums an empty array to zero", () => {
    expect(sumCents([])).toBe(0);
  });

  it("sums negative and positive amounts", () => {
    expect(sumCents([500, -200, 300])).toBe(600);
  });
});

describe("centsToInputString", () => {
  it("formats without a currency symbol", () => {
    expect(centsToInputString(123456)).toBe("1234,56");
  });

  it("pads single-digit cents", () => {
    expect(centsToInputString(105)).toBe("1,05");
  });

  it("formats zero", () => {
    expect(centsToInputString(0)).toBe("0,00");
  });

  it("formats negative amounts", () => {
    expect(centsToInputString(-500)).toBe("-5,00");
  });

  it("round-trips through brlToCents", () => {
    expect(brlToCents(centsToInputString(999901))).toBe(999901);
  });

  it("throws on non-integer input", () => {
    expect(() => centsToInputString(10.5)).toThrow(TypeError);
  });
});
