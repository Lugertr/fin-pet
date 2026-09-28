// src/components/adventure/ShiftBudgetCard/ShiftBudgetCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createShiftBudgetCardStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withAlpha(theme.primary, 0.12),
    },
    title: {
      flex: 1,
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    amountChip: {
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: withAlpha(theme.primary, 0.12),
    },
    amountText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    tiles: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    tile: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    tileLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    tileLabel: {
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    tileValue: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    caption: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
  });
}
