// src/components/savings/SavingsGoalCard/SavingsGoalCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import {
  colorPalettes,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
  touchTarget,
} from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createSavingsGoalCardStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surfaceElevated,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    imageBox: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: withAlpha(colorPalettes.emerald[500], 0.12),
      borderWidth: 1,
      borderColor: withAlpha(colorPalettes.emerald[500], 0.45),
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
    },
    overline: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    name: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    caption: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginTop: 2,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    // Цвет цифр — зелёный, как «Коплю» (planCategoryTextColor, задаётся в компоненте).
    amountSaved: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
    },
    amountTotal: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    percent: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    progressTrack: {
      height: 10,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    facts: {
      gap: spacing.sm,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    factRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    factText: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: fontSizes.md,
    },
    outlineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: 52,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: theme.primary,
      backgroundColor: theme.surfaceElevated,
    },
    outlineButtonText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    linkRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xl,
      marginBottom: -spacing.sm,
    },
    linkButton: {
      minHeight: touchTarget.recommended,
      minWidth: touchTarget.recommended,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkButtonText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      textDecorationLine: 'underline',
    },
    emptyTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      textAlign: 'center',
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    emptySaved: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    primaryButton: {
      minHeight: 52,
      borderRadius: radius.lg,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
