import { useQuery } from "@tanstack/react-query";

import { listInstallmentSchedule } from "./repository";

export function useInstallmentSchedule(profileId: string | null, year: number) {
  return useQuery({
    queryKey: ["transactions-summary", profileId ?? "", "installments", year],
    queryFn: () => listInstallmentSchedule(profileId as string, year),
    enabled: profileId !== null,
  });
}
