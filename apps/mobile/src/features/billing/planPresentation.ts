import type { PurchasesPackage } from "react-native-purchases";

const TYPE_LABEL: Partial<Record<string, string>> = {
  MONTHLY: "Mensal",
  ANNUAL: "Anual",
  LIFETIME: "Vitalício",
  SIX_MONTH: "Semestral",
  THREE_MONTH: "Trimestral",
  TWO_MONTH: "Bimestral",
  WEEKLY: "Semanal",
};

/** Human label for a RevenueCat package type, falling back to the product's own title. */
export function packageTypeLabel(pkg: PurchasesPackage): string {
  return TYPE_LABEL[pkg.packageType] ?? pkg.product.title;
}

export function findByType(
  packages: readonly PurchasesPackage[],
  type: "MONTHLY" | "ANNUAL" | "LIFETIME",
): PurchasesPackage | undefined {
  return packages.find((pkg) => pkg.packageType === type);
}

/** Whole-percent savings of the annual plan vs. paying monthly for 12 months, or null if there's nothing to compare against. */
export function annualSavingsPercent(monthlyPrice: number, annualPrice: number): number | null {
  if (monthlyPrice <= 0) return null;
  const monthlyEquivalent = annualPrice / 12;
  const savings = 1 - monthlyEquivalent / monthlyPrice;
  if (savings <= 0) return null;
  return Math.round(savings * 100);
}
