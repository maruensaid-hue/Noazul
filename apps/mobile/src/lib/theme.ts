/**
 * JS-side mirror of the semantic colors in tailwind.config.js. Use this only
 * where a className can't reach — react-native-svg props, conditional inline
 * styles chosen at runtime (e.g. "red once overspent"), ActivityIndicator/
 * StatusBar. Everything else should use the `brand`/`success`/`danger`/
 * `warning` Tailwind classes directly.
 */
export const colors = {
  brand: "#065FCE",
  accent: "#FE6D0F",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
  neutral: "#9CA3AF",
} as const;
