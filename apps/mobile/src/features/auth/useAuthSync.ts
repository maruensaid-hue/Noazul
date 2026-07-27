import { useEffect } from "react";

import { isAuthConfigured, supabase } from "../../services/supabaseClient";
import { useAuthStore } from "../../stores/authStore";

/** Restores any persisted Supabase session on boot and keeps it live across sign-in/out — mirrors useBillingSync. */
export function useAuthSync(): void {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    if (!isAuthConfigured()) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession]);
}
