import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  /** Null until a session is restored/created — nothing in the app requires it except direct payment sync. */
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
