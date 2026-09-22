// src/components/pet/MoodIndicator/MoodIndicator.tsx
// Анимированный индикатор настроения с подсказками

import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { getMoodColor, getMoodEmoji } from '@/lib/utils/formatters';
import { useTheme } from '@/theme';
import type { IconName } from '@/types/icons';
import { createMoodIndicatorStyles } from './MoodIndicator.styles';

interface MoodIndicatorProps {
  mood: number; // 0-100
  showLabel?: boolean;
  showTip?: boolean;
}

export function MoodIndicator({ mood, showLabel = true, showTip = false }: MoodIndicatorProps) {
  const { theme } = useTheme();

  const moodColor = getMoodColor(mood, theme);
  const moodEmoji = getMoodEmoji(mood);

  const styles = createMoodIndicatorStyles({ theme, moodColor, tipColor: moodColor });

  // Анимации
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(mood, { duration: 800 });
  }, [mood, progress]);

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
  }, [mood, pulse]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // Подсказка в зависимости от настроения
  const getTip = (): { icon: IconName; text: string } => {
    if (mood <= 0) return { icon: 'moon', text: 'Питомец спит. Новые уроки недоступны.' };
    if (mood <= 20)
      return { icon: 'alert-circle', text: 'Питомец устал. Бонус к доходу не активен.' };
    if (mood <= 50)
      return { icon: 'information-circle', text: 'Настроение среднее. Бонус к доходу не активен.' };
    return { icon: 'sparkles', text: 'Отличное настроение! Бонус к доходу активен!' };
  };

  const tip = getTip();

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      {showLabel && (
        <View style={styles.headerRow}>
          <Text style={styles.label}>Энергия</Text>
          <Animated.View style={[styles.moodBadge, animatedPulseStyle]}>
            <Text style={styles.moodEmoji}>{moodEmoji}</Text>
            <Text style={styles.moodText}>{mood}%</Text>
          </Animated.View>
        </View>
      )}

      {/* Шкала с градиентом */}
      <View style={styles.barContainer}>
        <View style={{ width: `${mood}%`, height: '100%' }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: moodColor,
            }}
          />
        </View>
      </View>

      {/* Подсказка с иконкой */}
      {showTip && (
        <View style={styles.tipContainer}>
          <Ionicons name={tip.icon} size={18} color={moodColor} />
          <Text style={styles.tipText}>{tip.text}</Text>
        </View>
      )}
    </View>
  );
}
