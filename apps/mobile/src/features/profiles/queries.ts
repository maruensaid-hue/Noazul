import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useProfileStore } from "../../stores/profileStore";
import {
  createProfile,
  deleteProfile,
  getActiveProfileId,
  listProfiles,
  renameProfile,
  setActiveProfile,
} from "./repository";

export const profileKeys = {
  list: ["profiles"] as const,
};

export function useProfiles() {
  return useQuery({ queryKey: profileKeys.list, queryFn: listProfiles });
}

/**
 * Creates a profile and immediately switches to it — used by onboarding (the
 * very first profile) and by the profiles screen's "novo perfil" (you just
 * made it, you're about to use it). Composing createProfile + setActiveProfile
 * (rather than passing isDefault at insert time) keeps this correct no matter
 * how many profiles already exist: setActiveProfile always clears every other
 * row's flag first.
 */
export function useCreateAndActivateProfile() {
  const queryClient = useQueryClient();
  const setActiveProfileId = useProfileStore((state) => state.setActiveProfileId);
  return useMutation({
    mutationFn: async (name: string) => {
      const id = await createProfile(name);
      await setActiveProfile(id);
      return id;
    },
    onSuccess: (id) => {
      setActiveProfileId(id);
      void queryClient.invalidateQueries({ queryKey: profileKeys.list });
    },
  });
}

export function useRenameProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameProfile(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.list }),
  });
}

/**
 * Deleting the currently-active profile promotes another one to active in
 * the DB (repository.ts); this re-reads that choice so the Zustand store —
 * and every profileId-scoped query — stays in sync with what's on disk.
 */
export function useDeleteProfile() {
  const queryClient = useQueryClient();
  const setActiveProfileId = useProfileStore((state) => state.setActiveProfileId);
  return useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: async () => {
      const activeId = await getActiveProfileId();
      if (activeId) setActiveProfileId(activeId);
      void queryClient.invalidateQueries({ queryKey: profileKeys.list });
    },
  });
}

/**
 * Persists the switch (so the app reopens into it next boot) and flips the
 * Zustand store in the same step. Every other query is keyed by profileId,
 * so this single write is what makes every screen refetch scoped data.
 */
export function useSwitchActiveProfile() {
  const queryClient = useQueryClient();
  const setActiveProfileId = useProfileStore((state) => state.setActiveProfileId);
  return useMutation({
    mutationFn: (id: string) => setActiveProfile(id),
    onSuccess: (_result, id) => {
      setActiveProfileId(id);
      void queryClient.invalidateQueries({ queryKey: profileKeys.list });
    },
  });
}
