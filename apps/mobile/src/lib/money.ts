/**
 * Money is always represented as an integer number of cents everywhere except
 * at the UI boundary. Never use floats for currency math (see noazul-blueprint.md §1.4).
 */

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Converts an integer amount of cents to a BRL-formatted string, e.g. 123456 -> "R$ 1.234,56". */
export function centsToBRL(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new TypeError(`centsToBRL expects an integer number of cents, got ${cents}`);
  }
  return BRL_FORMATTER.format(cents / 100);
}

/**
 * Parses a user-entered BRL string (e.g. "1.234,56", "1234,56", "1234.56", "1234")
 * into an integer number of cents. Throws on unparseable input.
 */
export function brlToCents(input: string): number {
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new TypeError("brlToCents received an empty string");
  }

  const cleaned = trimmed.replace(/[^\d,.-]/g, "");
  const isNegative = cleaned.startsWith("-");
  const unsigned = cleaned.replace(/^-/, "");

  if (!/\d/.test(unsigned)) {
    throw new TypeError(`brlToCents could not parse "${input}"`);
  }

  const hasComma = unsigned.includes(",");
  const hasDot = unsigned.includes(".");

  let normalized: string;
  if (hasComma && hasDot) {
    // pt-BR grouping: "1.234,56" -> thousands separator is ".", decimal is ","
    normalized = unsigned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = unsigned.replace(",", ".");
  } else {
    normalized = unsigned;
  }

  const value = Number(normalized);
  if (Number.isNaN(value)) {
    throw new TypeError(`brlToCents could not parse "${input}"`);
  }

  const cents = Math.round(value * 100);
  return isNegative ? -cents : cents;
}

/** Sums an array of integer cent amounts, guarding against float drift. */
export function sumCents(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => total + Math.trunc(amount), 0);
}
