// components/pet/MoodIndicator.tsx
// Анимированный индикатор настроения с подсказками

import { getMoodColor, getMoodEmoji } from '@/lib/utils/formatters';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface MoodIndicatorProps {
  mood: number; // 0-100
  showLabel?: boolean;
  showTip?: boolean;
}

export function MoodIndicator({ mood, showLabel = true, showTip = false }: MoodIndicatorProps) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Анимация заполнения шкалы
  useEffect(() => {
    progress.value = withTiming(mood, { duration: 800 });
  }, [mood]);

  // Пульсация при низком настроении
  useEffect(() => {
    if (mood <= 20) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        false
      );
    } else {
      pulse.value = 1;
    }
  }, [mood]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 50, 100],
      ['#EF4444', '#F59E0B', '#22C55E']
    ),
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const getMoodTip = () => {
    if (mood <= 0) return 'Питомец спит. Новые уроки недоступны.';
    if (mood <= 20) return 'Питомец устал. Бонус к доходу не активен.';
    if (mood <= 50) return 'Настроение среднее. Бонус к доходу не активен.';
    return 'Отличное настроение! Бонус к доходу активен! ✨';
  };

  return (
    <View className="w-full">
      {/* Заголовок */}
      {showLabel && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-slate-400 text-sm">Настроение</Text>
          <Animated.View style={animatedPulseStyle}>
            <Text style={{ color: getMoodColor(mood) }} className="font-semibold">
              {getMoodEmoji(mood)} {mood}%
            </Text>
          </Animated.View>
        </View>
      )}

      {/* Шкала */}
      <View className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <Animated.View className="h-full rounded-full" style={animatedBarStyle} />
      </View>

      {/* Подсказка */}
      {showTip && (
        <View
          className={`mt-2 px-3 py-2 rounded-lg ${
            mood > 50 ? 'bg-green-500/10' : mood > 20 ? 'bg-amber-500/10' : 'bg-red-500/10'
          }`}
        >
          <Text
            className={`text-sm text-center ${
              mood > 50 ? 'text-green-400' : mood > 20 ? 'text-amber-400' : 'text-red-400'
            }`}
          >
            {getMoodTip()}
          </Text>
        </View>
      )}
    </View>
  );
}
