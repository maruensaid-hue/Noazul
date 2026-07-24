import * as Linking from "expo-linking";
import { useEffect } from "react";

import { isAuthConfigured } from "../../services/supabaseClient";
import { completeLoginFromCode } from "./repository";

/**
 * Catches the noazul://login?code=... redirect the login e-mail link points
 * to and exchanges it for a session — useAuthSync picks up the resulting
 * session change via onAuthStateChange, no extra wiring needed here.
 */
export function useLoginDeepLink(): void {
  useEffect(() => {
    if (!isAuthConfigured()) return;

    function handleUrl(url: string) {
      const { queryParams } = Linking.parse(url);
      const code = queryParams?.code;
      if (typeof code !== "string") return;
      completeLoginFromCode(code).catch(() => {
        // Link already used or expired — user can request a fresh one from the login screen.
      });
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);
}
