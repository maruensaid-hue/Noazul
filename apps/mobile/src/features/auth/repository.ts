import { isAuthConfigured, supabase } from "../../services/supabaseClient";

/** Sends a 6-digit login code to the given e-mail via Supabase Auth (email OTP). */
export async function sendLoginCode(email: string): Promise<void> {
  if (!isAuthConfigured()) {
    throw new Error("Login por e-mail ainda não está disponível nesta versão.");
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw new Error(error.message);
}

/** Verifies the code the user typed and establishes a session (persisted automatically). */
export async function verifyLoginCode(email: string, code: string): Promise<void> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error || !data.session) {
    throw new Error(error?.message ?? "Código inválido ou expirado.");
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
