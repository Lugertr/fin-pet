// src/components/adventure/AdventurePlanFactCard/AdventurePlanFactCard.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createAdventurePlanFactCardStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      gap: spacing.lg,
      ...shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    tag: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    tagText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    row: {
      gap: spacing.sm,
    },
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: radius.full,
    },
    label: {
      flex: 1,
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
    },
    values: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    fact: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
    },
    // Сегменты полоски — дети в ряд; скругление даёт overflow трека.
    track: {
      flexDirection: 'row',
      height: 10,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: spacing.lg,
      rowGap: spacing.xs,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    legendText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
  });
}
