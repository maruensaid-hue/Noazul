/**
 * Sends a push notification through Expo's push service — no SDK needed,
 * it's a single JSON POST. See server/db.ts's User.pushToken for where the
 * token comes from (registered by the mobile app after login).
 */
export async function sendPushNotification(params: {
  pushToken: string;
  title: string;
  body: string;
}): Promise<void> {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: params.pushToken,
        title: params.title,
        body: params.body,
        sound: "default",
      }),
    });
  } catch {
    // Best-effort — a push failure shouldn't break payment processing.
  }
}
