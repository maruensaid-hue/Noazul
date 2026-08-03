import { NextResponse, type NextRequest } from "next/server";

import { requireUser, UnauthorizedError } from "../../../server/auth";
import { clientIp, isRateLimited, rateLimitResponse } from "../../../server/rateLimit";

export async function GET(request: NextRequest) {
  if (isRateLimited(`entitlement:${clientIp(request)}`, 30, 60_000)) {
    return rateLimitResponse();
  }

  try {
    const user = await requireUser(request);
    return NextResponse.json({
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}
