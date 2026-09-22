// styles/screens/modal/_savings.styles.ts
// Стили экрана накоплений (§11 ТЗ). Стили модалки выбора цели переехали в
// src/components/savings/GoalPickerModal/GoalPickerModal.styles.ts вместе с компонентом.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface SavingsStylesParams {
  theme: Theme;
}

export function createSavingsStyles({ theme }: SavingsStylesParams) {
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
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    headerTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    balanceCard: {
      backgroundColor: withAlpha(theme.onGradient, 0.15),
      borderRadius: radius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: withAlpha(theme.onGradient, 0.2),
      alignItems: 'center',
    },
    balanceLabel: {
      color: withAlpha(theme.onGradient, 0.8),
      fontSize: fontSizes.sm,
      marginBottom: spacing.xs,
    },
    balanceValue: {
      color: theme.onGradient,
      fontSize: fontSizes.hero,
      fontWeight: fontWeights.bold,
    },
    balanceHint: {
      color: withAlpha(theme.onGradient, 0.85),
      fontSize: fontSizes.xs,
      marginTop: spacing.xs,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    // Фон/паддинг/радиус/рамка — от <Card padding="md">; здесь только отступ снизу.
    cardSpacing: {
      marginBottom: spacing.lg,
    },
    targetHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    targetIconBox: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    targetName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    targetPrice: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    targetProgressBar: {
      height: 10,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.sm,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    targetProgressText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    emptyTargetText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    secondaryButton: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    inputRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    inputField: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
    },
    quickAmountsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    quickAmountButton: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    quickAmountText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    depositButton: {
      flex: 1,
      backgroundColor: theme.success,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    withdrawButton: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    actionButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    withdrawButtonText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    infoBanner: {
      backgroundColor: withAlpha(theme.success, 0.1),
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: withAlpha(theme.success, 0.3),
    },
    infoBannerText: {
      color: theme.success,
      fontSize: fontSizes.xs,
      lineHeight: 16,
    },
  });
}
