import { describe, expect, it } from "vitest";

import { motivationalPhrase, motivationalTone } from "./phrases";

describe("motivationalPhrase", () => {
  it("returns a distinct phrase for each of the 7 bands", () => {
    const phrases = new Set(
      [-100000, -20000, -5000, 0, 5000, 30000, 100000].map((cents) => motivationalPhrase(cents)),
    );
    expect(phrases.size).toBe(7);
  });

  it("is stable at the exact band boundaries", () => {
    expect(motivationalPhrase(-50001)).not.toBe(motivationalPhrase(-50000));
    expect(motivationalPhrase(-10100)).toBe(motivationalPhrase(-50000 + 1));
    expect(motivationalPhrase(-1)).not.toBe(motivationalPhrase(0));
    expect(motivationalPhrase(0)).not.toBe(motivationalPhrase(1));
    expect(motivationalPhrase(9900)).not.toBe(motivationalPhrase(9901));
    expect(motivationalPhrase(50000)).not.toBe(motivationalPhrase(50001));
  });
});

describe("motivationalTone", () => {
  it("maps every band to the expected tone", () => {
    expect(motivationalTone(-100000)).toBe("danger");
    expect(motivationalTone(-10100)).toBe("danger");
    expect(motivationalTone(-10099)).toBe("warning");
    expect(motivationalTone(-1)).toBe("warning");
    expect(motivationalTone(0)).toBe("neutral");
    expect(motivationalTone(1)).toBe("success");
    expect(motivationalTone(100000)).toBe("success");
  });
});
