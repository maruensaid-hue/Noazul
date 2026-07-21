import { useMutation, useQuery } from "@tanstack/react-query";
import type { CustomerInfo, PurchasesError, PurchasesPackage } from "react-native-purchases";

import {
  getCurrentOffering,
  isEntitlementActive,
  purchasePackage,
  restorePurchases,
} from "../../services/purchases";
import { useBillingStore } from "../../stores/billingStore";

export function useCurrentOffering() {
  return useQuery({
    queryKey: ["billing", "current-offering"],
    queryFn: getCurrentOffering,
  });
}

export function usePurchasePackage() {
  const setIsPremium = useBillingStore((state) => state.setIsPremium);
  return useMutation<CustomerInfo, PurchasesError, PurchasesPackage>({
    mutationFn: (pkg) => purchasePackage(pkg),
    onSuccess: (customerInfo) => setIsPremium(isEntitlementActive(customerInfo)),
  });
}

export function useRestorePurchases() {
  const setIsPremium = useBillingStore((state) => state.setIsPremium);
  return useMutation<CustomerInfo, PurchasesError, void>({
    mutationFn: () => restorePurchases(),
    onSuccess: (customerInfo) => setIsPremium(isEntitlementActive(customerInfo)),
  });
}
