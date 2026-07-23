import {
  MercadoPagoConfig,
  Payment as MpPayment,
  PreApproval as MpPreApproval,
  Preference as MpPreference,
  WebhookSignatureValidator,
} from "mercadopago";
import type { SubscriptionPlan } from "../generated/prisma/enums";

import { PLAN_CONFIG } from "./plans";

const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
});

const preferenceClient = new MpPreference(mpConfig);
const preApprovalClient = new MpPreApproval(mpConfig);
const paymentClient = new MpPayment(mpConfig);

/** noazul:// deep link — expo-web-browser's openAuthSessionAsync resolves when the checkout redirects here. */
function deepLink(status: "success" | "pending" | "failure"): string {
  const scheme = process.env.APP_DEEP_LINK_SCHEME ?? "noazul";
  return `${scheme}://payment/return?status=${status}`;
}

/** One-time Checkout Pro purchase — used for the LIFETIME plan. */
export async function createLifetimePreference(params: {
  paymentId: string;
  userEmail: string;
}): Promise<{ id: string; initPoint: string }> {
  const plan = PLAN_CONFIG.LIFETIME;
  const response = await preferenceClient.create({
    body: {
      items: [
        {
          id: "noazul-premium-lifetime",
          title: "NoAzul Premium — Vitalício",
          quantity: 1,
          unit_price: plan.amountCents / 100,
          currency_id: "BRL",
        },
      ],
      payer: { email: params.userEmail },
      external_reference: params.paymentId,
      back_urls: {
        success: deepLink("success"),
        pending: deepLink("pending"),
        failure: deepLink("failure"),
      },
      notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
    },
  });

  if (!response.id || !response.init_point) {
    throw new Error("Mercado Pago não retornou init_point para a preference criada.");
  }
  return { id: response.id, initPoint: response.init_point };
}

/** Recurring subscription — used for MONTHLY/ANNUAL plans. */
export async function createSubscriptionPreapproval(params: {
  paymentId: string;
  userEmail: string;
  plan: Extract<SubscriptionPlan, "MONTHLY" | "ANNUAL">;
}): Promise<{ id: string; initPoint: string }> {
  const plan = PLAN_CONFIG[params.plan];
  const response = await preApprovalClient.create({
    body: {
      reason: `NoAzul Premium — ${plan.label}`,
      external_reference: params.paymentId,
      payer_email: params.userEmail,
      back_url: deepLink("success"),
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.amountCents / 100,
        currency_id: "BRL",
      },
      status: "pending",
    },
  });

  if (!response.id || !response.init_point) {
    throw new Error("Mercado Pago não retornou init_point para a assinatura criada.");
  }
  return { id: response.id, initPoint: response.init_point };
}

export async function getMpPayment(id: string) {
  return paymentClient.get({ id });
}

export async function getMpPreApproval(id: string) {
  return preApprovalClient.get({ id });
}

export function validateWebhookSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;
  try {
    WebhookSignatureValidator.validate({
      xSignature: params.xSignature,
      xRequestId: params.xRequestId,
      dataId: params.dataId,
      secret,
      toleranceSeconds: 300,
    });
    return true;
  } catch {
    return false;
  }
}
