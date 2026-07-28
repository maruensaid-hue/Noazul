import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  listCategories,
  renameCategory,
  updateCategoryColor,
} from "./repository";

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

function useInvalidateCategories(profileId: string | null) {
  const queryClient = useQueryClient();
  return () => {
    if (!profileId) return;
    void queryClient.invalidateQueries({ queryKey: categoryKeys.forProfile(profileId) });
  };
}

export function useCreateCategory(profileId: string | null) {
  const invalidate = useInvalidateCategories(profileId);
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      createCategory(profileId as string, name, color),
    onSuccess: invalidate,
  });
}

export function useRenameCategory(profileId: string | null) {
  const invalidate = useInvalidateCategories(profileId);
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameCategory(id, name),
    onSuccess: invalidate,
  });
}

export function useUpdateCategoryColor(profileId: string | null) {
  const invalidate = useInvalidateCategories(profileId);
  return useMutation({
    mutationFn: ({ id, color }: { id: string; color: string }) => updateCategoryColor(id, color),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory(profileId: string | null) {
  const invalidate = useInvalidateCategories(profileId);
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  });
}
