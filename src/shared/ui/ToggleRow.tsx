import { Pressable, Text, View } from 'react-native';

export interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
    >
      <Text className="text-base text-text flex-1">{label}</Text>
      <View
        className={`w-12 h-7 rounded-full justify-center px-1 ${
          value ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <View className={`w-5 h-5 bg-white rounded-full ${value ? 'self-end' : 'self-start'}`} />
      </View>
    </Pressable>
  );
}
