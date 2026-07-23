import type { NextRequest } from "next/server";

import { prisma } from "./db";
import { verifyAccessToken } from "./supabaseAdmin";

export class UnauthorizedError extends Error {}

/**
 * Verifies the request's bearer token against Supabase Auth, then returns the
 * matching Prisma `User` row — creating it on first sight (the row doesn't
 * exist until a Supabase-authenticated user hits this backend for the first time).
 */
export async function requireUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Token de acesso ausente.");
  }

  const authUser = await verifyAccessToken(token);
  if (!authUser) {
    throw new UnauthorizedError("Token de acesso inválido ou expirado.");
  }

  return prisma.user.upsert({
    where: { id: authUser.id },
    update: { email: authUser.email },
    create: { id: authUser.id, email: authUser.email },
  });
}
