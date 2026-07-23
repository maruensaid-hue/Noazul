import { Pressable, Text, useColorScheme, View } from "react-native";

import { colors } from "../../lib/theme";

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  activeColor?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  activeColor = colors.brand,
}: SegmentedControlProps<T>) {
  const isDark = useColorScheme() === "dark";
  const inactiveBackground = isDark ? "#1F2937" : "white";

  return (
    <View className="flex-row overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center py-3 ${index > 0 ? "border-l border-gray-200 dark:border-gray-700" : ""}`}
            style={{ backgroundColor: isActive ? activeColor : inactiveBackground }}
          >
            <Text
              className={isActive ? "font-semibold text-white" : "text-gray-700 dark:text-gray-300"}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
