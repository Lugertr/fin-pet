// src/components/arcade/PlayingStage/PlayingStage.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PlayingStageStylesParams {
  theme: Theme;
}

export function createPlayingStageStyles({ theme }: PlayingStageStylesParams) {
  return StyleSheet.create({
    gameContainer: {
      flex: 1,
      padding: spacing.xxl,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    progressLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    progressCoinsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    progressCoins: {
      color: theme.coins,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
      marginBottom: spacing.xxl,
    },
  });
}
