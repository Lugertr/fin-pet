// src/components/hub/PeriodCard/PeriodCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PeriodCardStylesParams {
  theme: Theme;
}

export function createPeriodCardStyles({ theme }: PeriodCardStylesParams) {
  return StyleSheet.create({
    periodSection: {
      paddingHorizontal: spacing.xxl,
      paddingBottom: spacing.lg,
    },
    periodHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    periodBadge: {
      backgroundColor: withAlpha(theme.primary, 0.15),
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs,
      borderRadius: radius.full,
    },
    periodBadgeText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
    },
    periodCategoriesRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    periodCategoryItem: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    periodCategoryLabel: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      marginBottom: spacing.xxs,
      textAlign: 'center',
    },
    periodCategoryValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    periodFinishButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    periodFinishButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
  });
}
