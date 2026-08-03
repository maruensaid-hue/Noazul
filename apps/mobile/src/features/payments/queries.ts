import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelSubscription,
  createDirectPayment,
  fetchEntitlement,
  fetchSubscription,
  isSyncApiConfigured,
  type DirectPlanId,
} from "../../services/syncApi";
import { useAuthStore } from "../../stores/authStore";
import { useBillingStore } from "../../stores/billingStore";

export function useCreateDirectPayment() {
  return useMutation({
    mutationFn: (plan: DirectPlanId) => createDirectPayment(plan),
  });
}

/** Polls the backend's view of premium status — the source of truth for direct (non-store) payments. */
export function useEntitlement() {
  const session = useAuthStore((state) => state.session);
  const setIsPremium = useBillingStore((state) => state.setIsPremium);

  return useQuery({
    queryKey: ["payments", "entitlement", session?.user.id],
    queryFn: async () => {
      const entitlement = await fetchEntitlement();
      if (entitlement.isPremium) setIsPremium(true);
      return entitlement;
    },
    enabled: Boolean(session) && isSyncApiConfigured(),
  });
}

export function useRefreshEntitlement() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["payments", "entitlement"] });
}

/** Plan + payment history for the direct (Mercado Pago) payment path — see the subscription screen. */
export function useSubscription() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ["payments", "subscription", session?.user.id],
    queryFn: fetchSubscription,
    enabled: Boolean(session) && isSyncApiConfigured(),
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const setIsPremium = useBillingStore((state) => state.setIsPremium);

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      setIsPremium(false);
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
