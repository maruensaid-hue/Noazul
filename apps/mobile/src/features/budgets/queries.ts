import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  copyBudgetsFromPreviousMonth,
  deleteBudget,
  listBudgetOverview,
  upsertBudget,
} from "./repository";

export const budgetKeys = {
  // Nested under the same root transactions mutations invalidate, since a
  // budget's "spent" figure depends on the transactions table too.
  overview: (profileId: string, yearMonth: string) =>
    ["transactions-summary", profileId, yearMonth, "budget-overview"] as const,
};

export function useBudgetOverview(profileId: string | null, yearMonth: string) {
  return useQuery({
    queryKey: budgetKeys.overview(profileId ?? "", yearMonth),
    queryFn: () => listBudgetOverview(profileId as string, yearMonth),
    enabled: profileId !== null,
  });
}

function useInvalidateBudgets(profileId: string | null) {
  const queryClient = useQueryClient();
  return () => {
    if (!profileId) return;
    void queryClient.invalidateQueries({ queryKey: ["transactions-summary", profileId] });
  };
}

export function useUpsertBudget(profileId: string | null) {
  const invalidate = useInvalidateBudgets(profileId);
  return useMutation({
    mutationFn: ({
      categoryId,
      yearMonth,
      limitCents,
    }: {
      categoryId: string;
      yearMonth: string;
      limitCents: number;
    }) => upsertBudget(profileId as string, categoryId, yearMonth, limitCents),
    onSuccess: invalidate,
  });
}

export function useDeleteBudget(profileId: string | null) {
  const invalidate = useInvalidateBudgets(profileId);
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: invalidate,
  });
}

export function useCopyBudgetsFromPreviousMonth(profileId: string | null) {
  const invalidate = useInvalidateBudgets(profileId);
  return useMutation({
    mutationFn: (yearMonth: string) => copyBudgetsFromPreviousMonth(profileId as string, yearMonth),
    onSuccess: invalidate,
  });
}
