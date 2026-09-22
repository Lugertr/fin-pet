// styles/screens/modal/_budget-planning.styles.ts
// Стили экрана планирования бюджета (§7.3 ТЗ)

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface BudgetPlanningStylesParams {
  theme: Theme;
}

export function createBudgetPlanningStyles({ theme }: BudgetPlanningStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      color: withAlpha(theme.onGradient, 0.85),
      fontSize: fontSizes.sm,
    },
    scrollContent: {
      padding: spacing.xxl,
      paddingBottom: spacing.xxxl,
    },
    // Фон/паддинг/радиус/рамка — от <Card padding="md">.
    availableCardSpacing: {
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    availableLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginBottom: spacing.xxs,
    },
    availableValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.hero,
    },
    remainderValue: {
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      marginTop: spacing.xs,
    },
    // Фон/паддинг/радиус/рамка — от <Card padding="md">.
    categoryCardSpacing: {
      marginBottom: spacing.md,
    },
    categoryHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    categoryTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    categoryDescription: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      marginBottom: spacing.md,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    stepperButton: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperInput: {
      flex: 1,
      textAlign: 'center',
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
    },
    confirmButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    confirmButtonDisabled: {
      opacity: 0.5,
    },
    confirmButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
