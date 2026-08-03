import { NextResponse, type NextRequest } from "next/server";

import { requireUser, UnauthorizedError } from "../../../server/auth";
import { prisma } from "../../../server/db";
import { clientIp, isRateLimited, rateLimitResponse } from "../../../server/rateLimit";

export async function GET(request: NextRequest) {
  if (isRateLimited(`subscription:${clientIp(request)}`, 30, 60_000)) {
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

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      plan: true,
      status: true,
      amountCents: true,
      createdAt: true,
      mpPreapprovalId: true,
    },
  });

  return NextResponse.json({
    isPremium: user.isPremium,
    premiumUntil: user.premiumUntil,
    payments,
  });
}
