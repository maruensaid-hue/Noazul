import { create } from "zustand";

interface ProfileState {
  /** The profile every screen currently reads/writes. Set once on boot (Fase 4 adds switching). */
  activeProfileId: string | null;
  setActiveProfileId: (id: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfileId: null,
  setActiveProfileId: (id) => set({ activeProfileId: id }),
}));
