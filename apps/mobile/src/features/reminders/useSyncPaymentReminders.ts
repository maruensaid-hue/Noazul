import { useEffect } from "react";
import * as Notifications from "expo-notifications";

import { syncScheduledReminders } from "../../services/notifications";
import { useBillingStore } from "../../stores/billingStore";
import { useProfileStore } from "../../stores/profileStore";
import { reminderLimitFor } from "./gate";
import { usePaymentRemindersEnabled, useUpcomingPendingExpenses } from "./queries";

/**
 * Mounted once at the app root (see app/_layout.tsx). Whenever the enabled
 * flag or the upcoming-pending-expenses list changes, reschedules every
 * local reminder from scratch. Turning reminders off just cancels everything.
 */
export function useSyncPaymentReminders(): void {
  const profileId = useProfileStore((state) => state.activeProfileId);
  const isPremium = useBillingStore((state) => state.isPremium);
  const enabledQuery = usePaymentRemindersEnabled();
  const enabled = enabledQuery.data === true;

  const upcomingQuery = useUpcomingPendingExpenses(
    enabled ? profileId : null,
    reminderLimitFor(isPremium),
  );

  useEffect(() => {
    if (!enabled) {
      void Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }
    if (!upcomingQuery.data) return;
    void syncScheduledReminders(upcomingQuery.data);
  }, [enabled, upcomingQuery.data]);
}
