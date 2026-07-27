import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import type { CategorySlice } from "../../features/summary/derived";

const DEFAULT_SIZE = 160;
const DEFAULT_STROKE_WIDTH = 24;

interface DonutChartProps {
  slices: readonly CategorySlice[];
  /** Defaults to the full-size chart used in the summary sheet — pass smaller values for compact placements (e.g. the month header). */
  size?: number;
  strokeWidth?: number;
  /** Track color for the empty state / unfilled remainder — defaults to a neutral gray, use a translucent white on dark backgrounds. */
  trackColor?: string;
}

/** Fraction of the circle already drawn before each slice, i.e. its start offset. */
function cumulativeFractions(slices: readonly CategorySlice[]): number[] {
  const offsets: number[] = [];
  let sum = 0;
  for (const slice of slices) {
    offsets.push(sum);
    sum += slice.fraction;
  }
  return offsets;
}

/**
 * Ring chart drawn with plain react-native-svg (no chart library — see
 * noazul-blueprint.md §6.3: "evitar libs de gráfico pesadas"). Each slice is a
 * Circle whose stroke-dasharray/-dashoffset carves out its arc; rotating -90°
 * moves the shared start point to 12 o'clock. Recomputes (and visibly
 * reshapes) every time `slices` changes, e.g. right after a new expense is saved.
 */
export function DonutChart({
  slices,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  trackColor = "#E5E7EB",
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (slices.length === 0) {
    return (
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  const startOffsets = cumulativeFractions(slices);

  return (
    <Svg width={size} height={size}>
      {slices.map((slice, index) => {
        const dashLength = slice.fraction * circumference;
        const dashOffset = -startOffsets[index]! * circumference;
        return (
          <Circle
            key={slice.categoryId ?? "none"}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            fill="none"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        );
      })}
    </Svg>
  );
}
