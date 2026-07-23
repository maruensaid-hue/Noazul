/** Free tier only gets reminders for the soonest few pending bills (noazul-blueprint paywall: "Notificações de pagamento ilimitadas"). */
export const FREE_REMINDER_LIMIT = 3;

/** Premium has no real cap — 200 upcoming reminders is far more than any household tracks at once. */
const PREMIUM_REMINDER_LIMIT = 200;

export function reminderLimitFor(isPremium: boolean): number {
  return isPremium ? PREMIUM_REMINDER_LIMIT : FREE_REMINDER_LIMIT;
}
