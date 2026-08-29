// components/pet/MoodBar.tsx
// Шкала настроения питомца

import { getMoodColor } from '@/lib/utils/formatters';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface MoodBarProps {
  mood: number; // 0-100
  showLabel?: boolean;
}

export function MoodBar({ mood, showLabel = true }: MoodBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(mood, { duration: 500 });
  }, [mood]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 50, 100],
      ['#EF4444', '#F59E0B', '#22C55E']
    ),
  }));

  return (
    <View className="w-full">
      {showLabel && (
        <View className="flex-row justify-between mb-1">
          <Text className="text-slate-400 text-sm">Настроение</Text>
          <Text style={{ color: getMoodColor(mood) }} className="font-semibold">
            {mood}%
          </Text>
        </View>
      )}
      <View className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <Animated.View className="h-full rounded-full" style={animatedBarStyle} />
      </View>
    </View>
  );
}
