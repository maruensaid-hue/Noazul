import { useQuery } from "@tanstack/react-query";

import { getMonthCategoryBreakdown, getMonthSummary } from "./repository";

export const summaryKeys = {
  month: (profileId: string, yearMonth: string) =>
    ["transactions-summary", profileId, yearMonth] as const,
  categoryBreakdown: (profileId: string, yearMonth: string) =>
    ["transactions-summary", profileId, yearMonth, "by-category"] as const,
};

export function useMonthSummary(profileId: string | null, yearMonth: string) {
  return useQuery({
    queryKey: summaryKeys.month(profileId ?? "", yearMonth),
    queryFn: () => getMonthSummary(profileId as string, yearMonth),
    enabled: profileId !== null,
  });
}

export function useMonthCategoryBreakdown(profileId: string | null, yearMonth: string) {
  return useQuery({
    queryKey: summaryKeys.categoryBreakdown(profileId ?? "", yearMonth),
    queryFn: () => getMonthCategoryBreakdown(profileId as string, yearMonth),
    enabled: profileId !== null,
  });
}
