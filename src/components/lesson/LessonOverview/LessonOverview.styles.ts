// src/components/lesson/LessonOverview/LessonOverview.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createLessonOverviewStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.md,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
    },
    starCard: {
      borderRadius: radius.xl,
      padding: spacing.md,
      backgroundColor: theme.surfaceLight,
    },
    starCardEarned: {
      backgroundColor: withAlpha(theme.coins, 0.2),
    },
    starText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    section: {
      gap: spacing.xs,
    },
    sectionTitle: {
      color: theme.textSecondary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: touchTarget.recommended + 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: theme.surface,
    },
    rowText: {
      flex: 1,
    },
    rowLabel: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
    },
    rowStatus: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    rowAction: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    closeButton: {
      minHeight: 56,
      borderRadius: radius.xl,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
