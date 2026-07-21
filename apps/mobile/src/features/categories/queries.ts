import { useQuery } from "@tanstack/react-query";

import { listCategories } from "./repository";

export const categoryKeys = {
  forProfile: (profileId: string) => ["categories", profileId] as const,
};

export function useCategories(profileId: string | null) {
  return useQuery({
    queryKey: categoryKeys.forProfile(profileId ?? ""),
    queryFn: () => listCategories(profileId as string),
    enabled: profileId !== null,
  });
}
