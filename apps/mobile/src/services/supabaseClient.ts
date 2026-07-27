import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False until EXPO_PUBLIC_SUPABASE_URL/_ANON_KEY are set — login and direct payment stay hidden until then. */
export function isAuthConfigured(): boolean {
  return supabaseUrl !== "" && supabaseAnonKey !== "";
}

// createClient needs a well-formed URL even when unconfigured, since this module
// is imported unconditionally (see useAuthSync) — every real call is gated behind
// isAuthConfigured() instead of skipping client creation.
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-anon-key", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE so the login link's noazul://login?code=... redirect can be
    // exchanged for a session with exchangeCodeForSession — see useLoginDeepLink.
    flowType: "pkce",
  },
});

// Supabase's token auto-refresh timer keeps running in the background unless
// paused, which wastes battery — recommended RN setup pauses/resumes it with
// app foreground state. See supabase-js React Native guide.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
