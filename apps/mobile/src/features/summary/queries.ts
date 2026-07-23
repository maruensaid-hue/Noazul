import { useQuery } from "@tanstack/react-query";

import {
  getMonthCategoryBreakdown,
  getMonthSummary,
  getYearCategoryBreakdown,
  getYearSummary,
} from "./repository";

export const summaryKeys = {
  month: (profileId: string, yearMonth: string) =>
    ["transactions-summary", profileId, yearMonth] as const,
  categoryBreakdown: (profileId: string, yearMonth: string) =>
    ["transactions-summary", profileId, yearMonth, "by-category"] as const,
  year: (profileId: string, year: number) => ["transactions-summary", profileId, "year", year] as const,
  yearCategoryBreakdown: (profileId: string, year: number) =>
    ["transactions-summary", profileId, "year", year, "by-category"] as const,
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

export function useYearSummary(profileId: string | null, year: number) {
  return useQuery({
    queryKey: summaryKeys.year(profileId ?? "", year),
    queryFn: () => getYearSummary(profileId as string, year),
    enabled: profileId !== null,
  });
}

export function useYearCategoryBreakdown(profileId: string | null, year: number) {
  return useQuery({
    queryKey: summaryKeys.yearCategoryBreakdown(profileId ?? "", year),
    queryFn: () => getYearCategoryBreakdown(profileId as string, year),
    enabled: profileId !== null,
  });
}
