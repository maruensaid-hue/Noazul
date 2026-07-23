import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import type { CategorySlice } from "../../features/summary/derived";

const SIZE = 160;
const STROKE_WIDTH = 24;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DonutChartProps {
  slices: readonly CategorySlice[];
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
 * moves the shared start point to 12 o'clock.
 */
export function DonutChart({ slices }: DonutChartProps) {
  if (slices.length === 0) {
    return (
      <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#E5E7EB"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  const startOffsets = cumulativeFractions(slices);

  return (
    <Svg width={SIZE} height={SIZE}>
      {slices.map((slice, index) => {
        const dashLength = slice.fraction * CIRCUMFERENCE;
        const dashOffset = -startOffsets[index]! * CIRCUMFERENCE;
        return (
          <Circle
            key={slice.categoryId ?? "none"}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={slice.color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${dashLength} ${CIRCUMFERENCE - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            fill="none"
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        );
      })}
    </Svg>
  );
}
