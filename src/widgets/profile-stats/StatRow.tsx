import { memo } from 'react';
import { Text, View } from 'react-native';

export interface StatRowProps {
  icon: string;
  label: string;
  value: string | number;
}

export const StatRow = memo(function StatRow({ icon, label, value }: StatRowProps) {
  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center">
        <Text className="text-lg mr-2">{icon}</Text>
        <Text className="text-sm text-text">{label}</Text>
      </View>
      <Text className="text-sm font-bold text-text">{value}</Text>
    </View>
  );
});
