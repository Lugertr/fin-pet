import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}

export const QuickAction = memo(function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
}: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center bg-gray-50 p-3 rounded-xl active:opacity-80 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-2xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text">{title}</Text>
        <Text className="text-sm text-gray-500">{subtitle}</Text>
      </View>
      <Text className="text-gray-400">→</Text>
    </Pressable>
  );
});
