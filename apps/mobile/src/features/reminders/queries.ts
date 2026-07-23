import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getPaymentRemindersEnabled,
  listUpcomingPendingExpenses,
  setPaymentRemindersEnabled,
} from "./repository";

const remindersEnabledKey = ["app-settings", "payment-reminders-enabled"] as const;

export function usePaymentRemindersEnabled() {
  return useQuery({
    queryKey: remindersEnabledKey,
    queryFn: getPaymentRemindersEnabled,
  });
}

export function useSetPaymentRemindersEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => setPaymentRemindersEnabled(enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: remindersEnabledKey }),
  });
}

export function useUpcomingPendingExpenses(profileId: string | null, limit: number) {
  return useQuery({
    queryKey: ["transactions", profileId ?? "", "upcoming-reminders", limit],
    queryFn: () => listUpcomingPendingExpenses(profileId as string, limit),
    enabled: profileId !== null,
  });
}
