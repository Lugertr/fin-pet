// src/components/hub/DailyRewardCard/DailyRewardCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface DailyRewardCardStylesParams {
  theme: Theme;
}

export function createDailyRewardCardStyles({ theme }: DailyRewardCardStylesParams) {
  return StyleSheet.create({
    dailySection: {
      paddingHorizontal: spacing.xxl,
      paddingBottom: spacing.lg,
    },
    dailyCard: {
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    dailyCardInner: {
      padding: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dailyLeftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    dailyIconBox: {
      width: 48,
      height: 48,
      borderRadius: circleRadius(48),
      backgroundColor: withAlpha(theme.onGradient, 0.2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    dailyTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    dailySubtitle: {
      color: withAlpha(theme.onGradient, 0.9),
      fontSize: fontSizes.sm,
    },
    dailyButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
    },
    dailyButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    streakRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
    },
    streakDayContainer: {
      alignItems: 'center',
    },
  });
}
