import { useEffect } from "react";

import { getExpoPushTokenIfPermitted } from "../../services/pushToken";
import { isSyncApiConfigured, registerPushToken } from "../../services/syncApi";
import { useAuthStore } from "../../stores/authStore";

/**
 * Registers the device's Expo push token with the backend whenever a session
 * exists, so the Mercado Pago webhook can notify "pagamento aprovado" — see
 * server/expoPush.ts. Silently does nothing if notifications aren't granted
 * or the user isn't logged in; never prompts for permission on its own.
 */
export function usePushTokenSync(): void {
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    if (!session || !isSyncApiConfigured()) return;
    getExpoPushTokenIfPermitted()
      .then((token) => {
        if (token) return registerPushToken(token).then(() => undefined);
      })
      .catch(() => {
        // Best-effort — push registration failing shouldn't block anything else.
      });
  }, [session]);
}
