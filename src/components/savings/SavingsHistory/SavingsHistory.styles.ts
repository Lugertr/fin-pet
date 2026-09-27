// src/components/savings/SavingsHistory/SavingsHistory.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createSavingsHistoryStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: theme.surfaceElevated,
      borderRadius: radius.xxl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    rowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
    info: {
      flex: 1,
    },
    label: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
    },
    date: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    amount: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
  });
}
