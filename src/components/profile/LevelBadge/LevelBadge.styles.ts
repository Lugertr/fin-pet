// src/components/profile/LevelBadge/LevelBadge.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LevelBadgeStylesParams {
  theme: Theme;
}

export function createLevelBadgeStyles({ theme }: LevelBadgeStylesParams) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    levelText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    progressBar: {
      height: 10,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.full,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    caption: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
  });
}
