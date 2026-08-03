import { NextResponse, type NextRequest } from "next/server";

import { requireUser, UnauthorizedError } from "../../../../server/auth";
import { prisma } from "../../../../server/db";
import { cancelPreapproval } from "../../../../server/mercadoPago";
import { clientIp, isRateLimited, rateLimitResponse } from "../../../../server/rateLimit";

/**
 * Cancels the user's active recurring subscription (MONTHLY/ANNUAL, paid
 * direct via Mercado Pago). LIFETIME has no ongoing charge to cancel, and a
 * purchase made through the App Store/Play Store (RevenueCat) is managed by
 * the store itself, not here — see the mobile screen for that split.
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(`subscription:cancel:${clientIp(request)}`, 5, 60_000)) {
    return rateLimitResponse();
  }

  let user;
  try {
    user = await requireUser(request);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const activeSubscription = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      status: "APPROVED",
      plan: { in: ["MONTHLY", "ANNUAL"] },
      mpPreapprovalId: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!activeSubscription?.mpPreapprovalId) {
    return NextResponse.json(
      { error: "Nenhuma assinatura recorrente ativa encontrada para cancelar." },
      { status: 400 },
    );
  }

  try {
    await cancelPreapproval(activeSubscription.mpPreapprovalId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao cancelar assinatura no Mercado Pago.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await prisma.payment.update({ where: { id: activeSubscription.id }, data: { status: "CANCELED" } });
  await prisma.user.update({ where: { id: user.id }, data: { isPremium: false } });

  return NextResponse.json({ ok: true });
}
