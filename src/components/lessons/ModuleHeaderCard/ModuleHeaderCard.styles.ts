// src/components/lessons/ModuleHeaderCard/ModuleHeaderCard.styles.ts
// Фон карточки — theme.gradients.accent (см. ModuleHeaderCard.tsx).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ModuleHeaderCardStylesParams {
  theme: Theme;
}

export function createModuleHeaderCardStyles({ theme }: ModuleHeaderCardStylesParams) {
  return StyleSheet.create({
    card: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      borderRadius: radius.xl,
      padding: spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      flexShrink: 1,
    },
    progressLabelRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xxs,
    },
    progressLabel: {
      color: withAlpha(theme.onGradient, 0.85),
      fontSize: fontSizes.sm,
    },
    progressFraction: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
    },
    progressBarTrack: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: withAlpha(theme.onGradient, 0.25),
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: theme.onGradient,
    },
  });
}
