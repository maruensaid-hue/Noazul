import type { DirectPlanId } from "../../services/syncApi";

/**
 * Mirrors apps/web-sync/server/plans.ts PLAN_CONFIG — the amount actually
 * charged always comes from the server; this is display-only so the direct
 * payment section can render prices without depending on RevenueCat/store
 * packages (which may not be configured at all, unlike this backend path).
 */
export interface DirectPlan {
  id: DirectPlanId;
  label: string;
  priceLabel: string;
  badge?: string;
  subtitle?: string;
}

export const DIRECT_PLANS: DirectPlan[] = [
  {
    id: "ANNUAL",
    label: "Anual",
    priceLabel: "R$ 79,90/ano",
    badge: "MELHOR ESCOLHA",
    subtitle: "Economize vs. mensal",
  },
  {
    id: "LIFETIME",
    label: "Vitalício",
    priceLabel: "R$ 149,90 uma vez",
    badge: "PAGUE 1 VEZ SÓ",
    subtitle: "Acesso para sempre, sem mensalidade",
  },
  {
    id: "MONTHLY",
    label: "Mensal",
    priceLabel: "R$ 9,90/mês",
    subtitle: "Flexível, cancele quando quiser",
  },
];
