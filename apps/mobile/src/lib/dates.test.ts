import { describe, expect, it } from "vitest";

import {
  currentYearMonth,
  daysInMonth,
  isValidYearMonth,
  parseYearMonth,
  shiftYearMonth,
  yearMonthLabel,
  yearMonthOf,
} from "./dates";

describe("isValidYearMonth", () => {
  it("accepts well-formed values", () => {
    expect(isValidYearMonth("2026-07")).toBe(true);
    expect(isValidYearMonth("2026-01")).toBe(true);
    expect(isValidYearMonth("2026-12")).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(isValidYearMonth("2026-13")).toBe(false);
    expect(isValidYearMonth("2026-00")).toBe(false);
    expect(isValidYearMonth("26-07")).toBe(false);
    expect(isValidYearMonth("2026/07")).toBe(false);
    expect(isValidYearMonth("")).toBe(false);
  });
});

describe("parseYearMonth", () => {
  it("parses year and month", () => {
    expect(parseYearMonth("2026-07")).toEqual({ year: 2026, month: 7 });
  });

  it("throws on invalid input", () => {
    expect(() => parseYearMonth("bogus")).toThrow(TypeError);
  });
});

describe("currentYearMonth", () => {
  it("derives the yearMonth from a given date in UTC", () => {
    expect(currentYearMonth(new Date("2026-07-21T12:00:00Z"))).toBe("2026-07");
  });
});

describe("shiftYearMonth", () => {
  it("moves forward within the same year", () => {
    expect(shiftYearMonth("2026-07", 1)).toBe("2026-08");
  });

  it("moves backward within the same year", () => {
    expect(shiftYearMonth("2026-07", -1)).toBe("2026-06");
  });

  it("rolls over to the next year", () => {
    expect(shiftYearMonth("2026-12", 1)).toBe("2027-01");
  });

  it("rolls back to the previous year", () => {
    expect(shiftYearMonth("2026-01", -1)).toBe("2025-12");
  });

  it("handles large deltas across multiple years", () => {
    expect(shiftYearMonth("2026-07", 18)).toBe("2028-01");
    expect(shiftYearMonth("2026-07", -18)).toBe("2025-01");
  });

  it("is a no-op with delta 0", () => {
    expect(shiftYearMonth("2026-07", 0)).toBe("2026-07");
  });
});

describe("daysInMonth", () => {
  it("returns 31 for July", () => {
    expect(daysInMonth({ year: 2026, month: 7 })).toBe(31);
  });

  it("returns 30 for April", () => {
    expect(daysInMonth({ year: 2026, month: 4 })).toBe(30);
  });

  it("returns 28 for a non-leap February", () => {
    expect(daysInMonth({ year: 2026, month: 2 })).toBe(28);
  });

  it("returns 29 for a leap February", () => {
    expect(daysInMonth({ year: 2028, month: 2 })).toBe(29);
  });
});

describe("yearMonthLabel", () => {
  it("formats a pt-BR month/year label", () => {
    expect(yearMonthLabel("2026-07")).toContain("2026");
    expect(yearMonthLabel("2026-07").toLowerCase()).toContain("julho");
  });
});

describe("yearMonthOf", () => {
  it("extracts the yearMonth bucket from an ISO date", () => {
    expect(yearMonthOf("2026-07-21T00:00:00.000Z")).toBe("2026-07");
  });

  it("throws on an invalid date string", () => {
    expect(() => yearMonthOf("not-a-date")).toThrow(TypeError);
  });
});
