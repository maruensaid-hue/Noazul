import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireUser, UnauthorizedError } from "../../../server/auth";
import { prisma } from "../../../server/db";
import { clientIp, isRateLimited, rateLimitResponse } from "../../../server/rateLimit";

const bodySchema = z.object({ pushToken: z.string().min(1) });

export async function POST(request: NextRequest) {
  if (isRateLimited(`push-token:${clientIp(request)}`, 10, 60_000)) {
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

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { pushToken: parsed.data.pushToken },
  });

  return NextResponse.json({ ok: true });
}
