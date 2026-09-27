// src/components/savings/SavingsBucketRow/SavingsBucketRow.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createSavingsBucketRowStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 88,
      backgroundColor: theme.surfaceElevated,
      borderRadius: radius.xxl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    iconBox: {
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    description: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginTop: 2,
    },
    side: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    amount: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    filledButton: {
      minHeight: touchTarget.recommended,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filledButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    // Неприметная ссылка: текст без фона, тап-зона всё равно ≥48dp (§23).
    linkButton: {
      minHeight: touchTarget.recommended,
      minWidth: touchTarget.recommended,
      paddingHorizontal: spacing.xs,
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginVertical: -spacing.sm,
    },
    linkButtonText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      textDecorationLine: 'underline',
    },
  });
}
