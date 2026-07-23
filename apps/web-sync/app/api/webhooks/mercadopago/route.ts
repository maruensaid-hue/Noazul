import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "../../../../server/db";
import { getMpPayment, getMpPreApproval, validateWebhookSignature } from "../../../../server/mercadoPago";

/**
 * Mercado Pago webhook — https://www.mercadopago.com.br/developers/panel →
 * sua aplicação → Webhooks. Register this route's full URL there, subscribed
 * to "Pagamentos" and "Assinaturas" events.
 *
 * Two event families land here:
 *  - "payment": a Checkout Pro purchase (our LIFETIME plan) or a recurring
 *    subscription charge.
 *  - "subscription_preapproval": a MONTHLY/ANNUAL subscription's own
 *    lifecycle (created, authorized, cancelled) — separate from its
 *    individual charges.
 *
 * KNOWN GAP: renewal charges for an already-active subscription arrive as
 * "payment" events too, but linking them back to the right internal
 * subscription (to extend `premiumUntil`) needs testing against real MP
 * payloads — the initial-authorization path below is implemented and
 * reasoned through, but hasn't run against production traffic yet.
 */
export async function POST(request: NextRequest) {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const dataId = request.nextUrl.searchParams.get("data.id");

  if (!validateWebhookSignature({ xSignature, xRequestId, dataId })) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { type?: string; data?: { id?: string } } | null;
  const topic = body?.type;
  const resourceId = body?.data?.id ?? dataId;
  if (!resourceId) {
    return NextResponse.json({ error: "Notificação sem id de recurso." }, { status: 400 });
  }

  if (topic === "payment") {
    await handlePaymentEvent(resourceId);
  } else if (topic === "subscription_preapproval") {
    await handlePreapprovalEvent(resourceId);
  }

  // Always 200 for recognized-but-irrelevant topics — Mercado Pago retries on non-2xx.
  return NextResponse.json({ received: true });
}

async function handlePaymentEvent(mpPaymentId: string): Promise<void> {
  const mpPayment = await getMpPayment(mpPaymentId);
  const ourPaymentId = mpPayment.external_reference;
  if (!ourPaymentId) return;

  const payment = await prisma.payment.findUnique({ where: { id: ourPaymentId } });
  if (!payment) return;

  const status = mapMpPaymentStatus(mpPayment.status);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status, mpPaymentId: String(mpPayment.id) },
  });

  if (status === "APPROVED" && payment.plan === "LIFETIME") {
    await prisma.user.update({
      where: { id: payment.userId },
      data: { isPremium: true, premiumUntil: null },
    });
  }
}

async function handlePreapprovalEvent(mpPreapprovalId: string): Promise<void> {
  const mpPreapproval = await getMpPreApproval(mpPreapprovalId);
  const ourPaymentId = mpPreapproval.external_reference;
  if (!ourPaymentId) return;

  const payment = await prisma.payment.findUnique({ where: { id: ourPaymentId } });
  if (!payment) return;

  const status = mapMpPreapprovalStatus(mpPreapproval.status);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status, mpPreapprovalId: String(mpPreapproval.id) },
  });

  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        isPremium: true,
        premiumUntil: mpPreapproval.next_payment_date ? new Date(mpPreapproval.next_payment_date) : null,
      },
    });
  } else if (status === "CANCELED") {
    await prisma.user.update({ where: { id: payment.userId }, data: { isPremium: false } });
  }
}

function mapMpPaymentStatus(status?: string): "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CANCELED" {
  switch (status) {
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    case "cancelled":
      return "CANCELED";
    default:
      return "PENDING";
  }
}

function mapMpPreapprovalStatus(status?: string): "PENDING" | "APPROVED" | "CANCELED" {
  switch (status) {
    case "authorized":
      return "APPROVED";
    case "cancelled":
      return "CANCELED";
    default:
      return "PENDING";
  }
}
