import { useEffect } from "react";

import { useBillingStore } from "../../stores/billingStore";
import { runAutoBackupIfDue } from "./autoBackup";

/**
 * Touches the DB directly, so it must only mount after migrations succeed —
 * see the AutoBackupSync wrapper in app/_layout.tsx, rendered inside the
 * post-migration tree rather than called unconditionally like useBillingSync.
 */
export function useAutoBackup(): void {
  const isPremium = useBillingStore((state) => state.isPremium);

  useEffect(() => {
    if (!isPremium) return;
    void runAutoBackupIfDue();
  }, [isPremium]);
}
