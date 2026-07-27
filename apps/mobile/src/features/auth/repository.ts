import { isAuthConfigured, supabase } from "../../services/supabaseClient";

export const LOGIN_REDIRECT_URL = "noazul://login";

/** Sends a one-tap login link to the given e-mail via Supabase Auth (PKCE). */
export async function sendLoginLink(email: string): Promise<void> {
  if (!isAuthConfigured()) {
    throw new Error("Login por e-mail ainda não está disponível nesta versão.");
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: LOGIN_REDIRECT_URL },
  });
  if (error) throw new Error(error.message);
}

/** Exchanges the ?code=... from the noazul://login redirect for a session — see useLoginDeepLink. */
export async function completeLoginFromCode(code: string): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
