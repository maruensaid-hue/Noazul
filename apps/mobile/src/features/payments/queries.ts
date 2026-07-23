import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../../stores/authStore";
import { useBillingStore } from "../../stores/billingStore";
import { createDirectPayment, fetchEntitlement, isSyncApiConfigured, type DirectPlanId } from "../../services/syncApi";

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
