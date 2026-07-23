import { NextResponse, type NextRequest } from "next/server";

import { requireUser, UnauthorizedError } from "../../../server/auth";

export async function GET(request: NextRequest) {
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
