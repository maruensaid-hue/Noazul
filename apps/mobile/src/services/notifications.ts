import * as Notifications from "expo-notifications";

import { localDateStringToDate } from "../lib/dates";
import { centsToBRL } from "../lib/money";

const REMINDER_HOUR = 9;

export interface ReminderTarget {
  id: string;
  name: string;
  amountCents: number;
  dueDate: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function getPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

export async function requestPermission(): Promise<boolean> {
  const settings = await Notifications.requestPermissionsAsync();
  return settings.status === "granted";
}

/**
 * Reschedules every payment reminder from scratch: cancels everything
 * previously scheduled, then schedules one local notification per target at
 * 9h local time on its due date. Simpler and less bug-prone than tracking a
 * notificationId per transaction — call this after any change to the
 * relevant transaction set (see features/reminders/useSyncPaymentReminders.ts).
 */
export async function syncScheduledReminders(targets: readonly ReminderTarget[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const target of targets) {
    const triggerDate = localDateStringToDate(target.dueDate);
    triggerDate.setHours(REMINDER_HOUR, 0, 0, 0);
    if (triggerDate.getTime() <= Date.now()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Conta vencendo hoje",
        body: `${target.name} — ${centsToBRL(target.amountCents)}`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  }
}
