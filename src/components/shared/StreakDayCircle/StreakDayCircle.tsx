// src/components/shared/StreakDayCircle/StreakDayCircle.tsx
// Один день недельного стрика (кружок с числом/галочкой/подарком) — раньше
// эта логика (и её цветовые обходы темы) была продублирована в
// StreakCalendar (профиль) и DailyRewardCard (хаб) почти дословно.

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { createStreakDayCircleStyles } from './StreakDayCircle.styles';

interface StreakDayCircleProps {
  day: number;
  isCompleted: boolean;
  isToday: boolean;
  /** День супер-кейса недели (7-й) — показывает 🎁 вместо номера, пока не пройден. */
  isSuperCase: boolean;
  /** Диаметр кружка (до масштабирования под экран). */
  size?: number;
}

export function StreakDayCircle({
  day,
  isCompleted,
  isToday,
  isSuperCase,
  size = 36,
}: StreakDayCircleProps) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const scaledSize = scale(size);
  const styles = createStreakDayCircleStyles({ theme, size: scaledSize, isCompleted, isToday });

  return (
    <View style={styles.circle}>
      {isCompleted ? (
        <Ionicons name="checkmark" size={Math.round(scaledSize / 2)} color={theme.onGradient} />
      ) : isSuperCase ? (
        <Text style={{ fontSize: Math.round(scaledSize * 0.44) }}>🎁</Text>
      ) : (
        <Text style={[styles.dayNumber, { fontSize: scaledFont('sm') }]}>{day}</Text>
      )}
    </View>
  );
}
