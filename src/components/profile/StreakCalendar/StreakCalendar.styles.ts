// src/components/profile/StreakCalendar/StreakCalendar.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface StreakCalendarStylesParams {
  theme: Theme;
}

export function createStreakCalendarStyles({ theme }: StreakCalendarStylesParams) {
  return StyleSheet.create({
    streakDaysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    streakDayContainer: {
      alignItems: 'center',
      flex: 1,
      gap: spacing.xs,
    },
    streakDayName: {
      color: theme.textMuted,
      fontSize: fontSizes.xxs,
    },
    streakProgressBar: {
      height: 6,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    streakInfoBanner: {
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    streakInfoText: {
      fontSize: fontSizes.sm,
      flex: 1,
    },
  });
}
