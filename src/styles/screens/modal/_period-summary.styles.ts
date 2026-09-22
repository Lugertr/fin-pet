// styles/screens/modal/_period-summary.styles.ts
// Стили экрана итогов периода — план vs факт (§7.4 ТЗ)

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { emojiSizes, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PeriodSummaryStylesParams {
  theme: Theme;
}

export function createPeriodSummaryStyles({ theme }: PeriodSummaryStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: spacing.xxl,
      paddingTop: 72,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    table: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: theme.borderLight,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    tableHeaderRow: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceLight,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    tableCellLabel: {
      flex: 1.4,
      color: theme.textPrimary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    tableCell: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      textAlign: 'right',
    },
    tableHeaderCell: {
      flex: 1,
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      textAlign: 'right',
    },
    tableHeaderCellLabel: {
      flex: 1.4,
      color: theme.textMuted,
      fontSize: fontSizes.xs,
    },
    stageUpCard: {
      backgroundColor: withAlpha(theme.success, 0.12),
      borderWidth: 1,
      borderColor: withAlpha(theme.success, 0.35),
      borderRadius: radius.xl,
      padding: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    stageUpEmoji: {
      fontSize: emojiSizes.md,
      marginBottom: spacing.xs,
    },
    stageUpTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    stageUpReason: {
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    successHint: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      textAlign: 'center',
      marginBottom: spacing.lg,
      lineHeight: 16,
    },
    bonusBanner: {
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    bonusBannerSuccess: {
      backgroundColor: withAlpha(theme.success, 0.1),
      borderWidth: 1,
      borderColor: withAlpha(theme.success, 0.3),
    },
    bonusBannerNeutral: {
      backgroundColor: withAlpha(theme.accent, 0.1),
      borderWidth: 1,
      borderColor: withAlpha(theme.accent, 0.3),
    },
    bonusText: {
      flex: 1,
      fontSize: fontSizes.sm,
      color: theme.textPrimary,
      lineHeight: 18,
    },
    nextButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: 'auto',
    },
    nextButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
