import * as Sentry from "@sentry/react-native";

/** No-ops until EXPO_PUBLIC_SENTRY_DSN is set — see .env.example. */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}
