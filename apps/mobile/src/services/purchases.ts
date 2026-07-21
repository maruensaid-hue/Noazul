import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";

/** Entitlement identifier configured in the RevenueCat dashboard. */
export const PREMIUM_ENTITLEMENT_ID = "premium";

function getApiKey(): string {
  return Platform.OS === "ios"
    ? (process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS ?? "")
    : (process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID ?? "");
}

let configured = false;

/**
 * Every function below no-ops (or resolves to a safe "not premium" default)
 * until a real RevenueCat API key is set via EXPO_PUBLIC_REVENUECAT_KEY_*.
 * That's expected until the RevenueCat project + store products exist
 * (noazul-blueprint.md §4 Fase 5 blocker: "contas Play Console/App Store
 * ativas") — the app stays fully usable on the free tier either way.
 */
export function isBillingConfigured(): boolean {
  return configured;
}

export function configurePurchases(): void {
  const apiKey = getApiKey();
  if (!apiKey || configured) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
  }
  Purchases.configure({ apiKey });
  configured = true;
}

export function isEntitlementActive(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  return Purchases.getCustomerInfo();
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/** Fires whenever RevenueCat pushes fresh entitlement state — e.g. right after a sandbox purchase completes, with no app restart needed. */
export function addCustomerInfoListener(listener: CustomerInfoUpdateListener): void {
  if (!configured) return;
  Purchases.addCustomerInfoUpdateListener(listener);
}

export function removeCustomerInfoListener(listener: CustomerInfoUpdateListener): void {
  Purchases.removeCustomerInfoUpdateListener(listener);
}
