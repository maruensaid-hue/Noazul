import { useAuthStore } from "../stores/authStore";

export function isSyncApiConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_SYNC_API_URL);
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_SYNC_API_URL;
  if (!baseUrl) {
    throw new Error("Pagamento direto ainda não está disponível nesta versão.");
  }
  const session = useAuthStore.getState().session;
  if (!session) {
    throw new Error("Entre com seu e-mail para continuar.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Erro ao comunicar com o servidor (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export type DirectPlanId = "MONTHLY" | "ANNUAL" | "LIFETIME";

export function createDirectPayment(plan: DirectPlanId): Promise<{ initPoint: string }> {
  return authFetch("/api/payments/create", { method: "POST", body: JSON.stringify({ plan }) });
}

export interface Entitlement {
  isPremium: boolean;
  premiumUntil: string | null;
}

export function fetchEntitlement(): Promise<Entitlement> {
  return authFetch("/api/entitlement");
}
