import { Pressable, Text, View } from "react-native";

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
  activeColor = "#2563EB",
}: SegmentedControlProps<T>) {
  return (
    <View className="flex-row overflow-hidden rounded-lg border border-gray-200">
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center py-3 ${index > 0 ? "border-l border-gray-200" : ""}`}
            style={{ backgroundColor: isActive ? activeColor : "white" }}
          >
            <Text className={isActive ? "font-semibold text-white" : "text-gray-700"}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
