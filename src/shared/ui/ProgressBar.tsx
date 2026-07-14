import { Text, View } from 'react-native';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  color = '#4ECDC4',
  label,
  showValue = false,
  size = 'md',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <View className="w-full">
      {(label || showValue) && (
        <View className="flex-row justify-between mb-1">
          {label && <Text className="text-sm font-medium text-text">{label}</Text>}
          {showValue && <Text className="text-sm text-gray-500">{Math.round(clampedValue)}%</Text>}
        </View>
      )}
      <View className={`${heightClass} bg-gray-200 rounded-full overflow-hidden`}>
        <View
          className="h-full rounded-full"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}
