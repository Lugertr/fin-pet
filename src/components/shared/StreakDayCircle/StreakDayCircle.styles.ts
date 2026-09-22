// src/components/shared/StreakDayCircle/StreakDayCircle.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, fontSizes, fontWeights } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface StreakDayCircleStylesParams {
  theme: Theme;
  size: number;
  isCompleted: boolean;
  isToday: boolean;
}

export function createStreakDayCircleStyles({
  theme,
  size,
  isCompleted,
  isToday,
}: StreakDayCircleStylesParams) {
  return StyleSheet.create({
    circle: {
      width: size,
      height: size,
      borderRadius: circleRadius(size),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isCompleted ? theme.success : isToday ? theme.warning : theme.surfaceLight,
      borderWidth: isToday ? 2 : 0,
      // Кольцо у «сегодня» — светлый тон того же акцента, что и сама заливка
      // (theme.coins — та же amber-семья, что и theme.warning).
      borderColor: isToday ? withAlpha(theme.coins, 0.5) : 'transparent',
    },
    dayNumber: {
      color: isToday ? theme.onWarning : theme.textMuted,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
  });
}
