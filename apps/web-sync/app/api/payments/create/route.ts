import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireUser, UnauthorizedError } from "../../../../server/auth";
import { prisma } from "../../../../server/db";
import { createLifetimePreference, createSubscriptionPreapproval } from "../../../../server/mercadoPago";
import { PLAN_CONFIG, isSubscriptionPlan } from "../../../../server/plans";

const bodySchema = z.object({
  plan: z.string().refine(isSubscriptionPlan, "Plano inválido"),
});

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireUser(request);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const { plan } = parsed.data;
  const planConfig = PLAN_CONFIG[plan];

  const payment = await prisma.payment.create({
    data: { userId: user.id, plan, amountCents: planConfig.amountCents, status: "PENDING" },
  });

  try {
    if (plan === "LIFETIME") {
      const { id, initPoint } = await createLifetimePreference({
        paymentId: payment.id,
        userEmail: user.email,
      });
      await prisma.payment.update({ where: { id: payment.id }, data: { mpPreferenceId: id } });
      return NextResponse.json({ initPoint });
    }

    const { id, initPoint } = await createSubscriptionPreapproval({
      paymentId: payment.id,
      userEmail: user.email,
      plan,
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { mpPreapprovalId: id } });
    return NextResponse.json({ initPoint });
  } catch (error) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "CANCELED" } });
    const message = error instanceof Error ? error.message : "Erro ao criar cobrança.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
