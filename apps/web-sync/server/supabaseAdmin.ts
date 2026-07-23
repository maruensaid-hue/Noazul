import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only, never exposed to the mobile
 * app. Used exclusively to verify the access token a request sends and
 * resolve it to a real Supabase Auth user (email + id).
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/** Verifies a bearer access token (issued by Supabase Auth on the mobile app) and returns its owner. */
export async function verifyAccessToken(accessToken: string): Promise<AuthenticatedUser | null> {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email };
}
