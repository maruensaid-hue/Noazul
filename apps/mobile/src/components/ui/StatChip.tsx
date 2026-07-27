import { Text, View } from "react-native";

import { centsToBRL } from "../../lib/money";

// Light pastel tints (Tailwind's *-300 scale) chosen for contrast against the
// brand-600 blue header — the semantic success/danger/warning tokens in
// tailwind.config.js only go as light as *-100, which isn't legible here.
const TONE_COLORS = {
  success: "#86EFAC",
  danger: "#FCA5A5",
  warning: "#FCD34D",
} as const;

interface StatChipProps {
  label: string;
  cents: number;
  tone: keyof typeof TONE_COLORS;
}

/** Small translucent stat card for the month header — a glanceable "Receita/Despesas/A pagar" row over the brand-blue background. */
export function StatChip({ label, cents, tone }: StatChipProps) {
  return (
    <View className="flex-1 gap-0.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
      <Text className="text-xs text-white/70">{label}</Text>
      <Text
        className="text-base font-bold"
        style={{ color: TONE_COLORS[tone] }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {centsToBRL(cents)}
      </Text>
    </View>
  );
}
