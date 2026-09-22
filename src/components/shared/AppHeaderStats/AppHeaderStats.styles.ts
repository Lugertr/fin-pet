// src/components/shared/AppHeaderStats/AppHeaderStats.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AppHeaderStatsStylesParams {
  theme: Theme;
}

export function createAppHeaderStatsStyles({ theme }: AppHeaderStatsStylesParams) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    rightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    statBadgesRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
    },
    statBadgeText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xs,
    },
    profileButton: {
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
