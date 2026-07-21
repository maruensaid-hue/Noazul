import { create } from "zustand";

interface BillingState {
  /** Defaults to free-tier (false) until RevenueCat resolves real entitlement state. */
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  isPremium: false,
  setIsPremium: (value) => set({ isPremium: value }),
}));
