// src/components/profile/AdventureStatsGrid/AdventureStatsGrid.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AdventureStatsGridStylesParams {
  theme: Theme;
}

export function createAdventureStatsGridStyles({ theme }: AdventureStatsGridStylesParams) {
  return StyleSheet.create({
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
      marginBottom: spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    tile: {
      flexBasis: '47%',
      flexGrow: 1,
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    value: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginTop: spacing.xs,
      marginBottom: spacing.xxs,
    },
    label: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
  });
}
