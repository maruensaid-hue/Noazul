import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import { getPermissionStatus } from "./notifications";

/**
 * Reuses the same OS permission "Lembretes de pagamento" already requests —
 * if the user granted that, we register a real push token silently. We
 * never prompt for permission here on our own; that stays Settings' job.
 */
export async function getExpoPushTokenIfPermitted(): Promise<string | null> {
  const status = await getPermissionStatus();
  if (status !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}
