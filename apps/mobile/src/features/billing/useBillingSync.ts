import { useEffect } from "react";
import type { CustomerInfo } from "react-native-purchases";

import {
  addCustomerInfoListener,
  configurePurchases,
  getCustomerInfo,
  isEntitlementActive,
  removeCustomerInfoListener,
} from "../../services/purchases";
import { useBillingStore } from "../../stores/billingStore";

/**
 * Configures RevenueCat once and keeps `useBillingStore().isPremium` live via
 * RevenueCat's own update listener — a sandbox purchase (or a restore) flips
 * this without needing an app restart, satisfying the Fase 5 acceptance
 * criterion directly.
 */
export function useBillingSync(): void {
  const setIsPremium = useBillingStore((state) => state.setIsPremium);

  useEffect(() => {
    configurePurchases();

    const listener = (customerInfo: CustomerInfo) => {
      setIsPremium(isEntitlementActive(customerInfo));
    };

    getCustomerInfo()
      .then((customerInfo) => {
        if (customerInfo) setIsPremium(isEntitlementActive(customerInfo));
      })
      .catch(() => {
        // Not configured yet (no API key) or a transient network error — stays on the free-tier default.
      });

    addCustomerInfoListener(listener);
    return () => removeCustomerInfoListener(listener);
  }, [setIsPremium]);
}
