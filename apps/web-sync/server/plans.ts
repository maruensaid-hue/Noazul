import type { SubscriptionPlan } from "../generated/prisma/enums";

/**
 * Single source of truth for what each plan costs — the mobile app only
 * displays these labels; the amount actually charged always comes from here,
 * server-side, never from client input (see app/api/payments/create).
 * Values match noazul-blueprint.md §2 pricing.
 */
export const PLAN_CONFIG: Record<
  SubscriptionPlan,
  { amountCents: number; label: string; recurring: boolean }
> = {
  MONTHLY: { amountCents: 990, label: "Mensal", recurring: true },
  ANNUAL: { amountCents: 7990, label: "Anual", recurring: true },
  LIFETIME: { amountCents: 14990, label: "Vitalício", recurring: false },
};

export function isSubscriptionPlan(value: string): value is SubscriptionPlan {
  return value === "MONTHLY" || value === "ANNUAL" || value === "LIFETIME";
}
