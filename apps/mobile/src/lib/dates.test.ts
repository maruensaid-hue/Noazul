import { describe, expect, it } from "vitest";

import {
  currentYearMonth,
  dateToLocalDateString,
  daysInMonth,
  isValidDateString,
  isValidYear,
  isValidYearMonth,
  localDateStringToDate,
  monthShortLabel,
  parseYearMonth,
  shiftDateByMonths,
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

describe("isValidYear", () => {
  it("accepts a 4-digit year", () => {
    expect(isValidYear("2026")).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(isValidYear("26")).toBe(false);
    expect(isValidYear("2026-07")).toBe(false);
    expect(isValidYear("")).toBe(false);
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

describe("monthShortLabel", () => {
  it("formats a short pt-BR month abbreviation", () => {
    expect(monthShortLabel("2026-07").toLowerCase()).toContain("jul");
    expect(monthShortLabel("2026-01").toLowerCase()).toContain("jan");
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

describe("isValidDateString", () => {
  it("accepts well-formed dates", () => {
    expect(isValidDateString("2026-07-21")).toBe(true);
    expect(isValidDateString("2026-02-29")).toBe(true);
  });

  it("rejects malformed dates", () => {
    expect(isValidDateString("2026-07-32")).toBe(false);
    expect(isValidDateString("2026-13-01")).toBe(false);
    expect(isValidDateString("2026/07/21")).toBe(false);
    expect(isValidDateString("")).toBe(false);
  });
});

describe("shiftDateByMonths", () => {
  it("shifts within the same month length", () => {
    expect(shiftDateByMonths("2026-07-10", 1)).toBe("2026-08-10");
    expect(shiftDateByMonths("2026-07-10", -1)).toBe("2026-06-10");
  });

  it("clamps day 31 into a shorter month", () => {
    expect(shiftDateByMonths("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("clamps into a leap February", () => {
    expect(shiftDateByMonths("2028-01-31", 1)).toBe("2028-02-29");
  });

  it("rolls over year boundaries", () => {
    expect(shiftDateByMonths("2026-12-15", 1)).toBe("2027-01-15");
    expect(shiftDateByMonths("2026-01-15", -1)).toBe("2025-12-15");
  });

  it("is a no-op with delta 0", () => {
    expect(shiftDateByMonths("2026-07-21", 0)).toBe("2026-07-21");
  });

  it("throws on an invalid date string", () => {
    expect(() => shiftDateByMonths("not-a-date", 1)).toThrow(TypeError);
  });
});

describe("localDateStringToDate / dateToLocalDateString", () => {
  it("round-trips using local calendar components", () => {
    const date = localDateStringToDate("2026-07-21");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(21);
    expect(dateToLocalDateString(date)).toBe("2026-07-21");
  });

  it("throws on an invalid date string", () => {
    expect(() => localDateStringToDate("not-a-date")).toThrow(TypeError);
  });

  it("pads single-digit month and day", () => {
    expect(dateToLocalDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
