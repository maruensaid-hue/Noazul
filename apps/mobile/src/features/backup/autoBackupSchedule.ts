export const AUTO_BACKUP_INTERVAL_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** True when auto-backup is due: never run before, or the interval has elapsed since `lastRunAt`. */
export function shouldRunAutoBackup(
  lastRunAt: string | null,
  now: Date,
  intervalDays: number = AUTO_BACKUP_INTERVAL_DAYS,
): boolean {
  if (lastRunAt === null) return true;
  const elapsedMs = now.getTime() - new Date(lastRunAt).getTime();
  return elapsedMs >= intervalDays * MS_PER_DAY;
}
