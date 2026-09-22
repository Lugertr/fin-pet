// src/components/arcade/ResultsStage/ResultsStage.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ResultsStageStylesParams {
  theme: Theme;
}

export function createResultsStageStyles({ theme }: ResultsStageStylesParams) {
  return StyleSheet.create({
    // Контент в ScrollView (flexGrow сохраняет justifyContent:'center' при
    // коротком содержимом), кнопки в ScreenFooter снаружи (см. ResultsStage.tsx).
    resultsContainer: {
      flex: 1,
    },
    resultsScrollArea: {
      flex: 1,
    },
    resultsScrollContent: {
      flexGrow: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
    },
    resultsHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    resultsIconBox: {
      width: 140,
      height: 140,
      borderRadius: circleRadius(140),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    resultsTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    resultsSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    resultsStatsCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      marginBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    accuracyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    accuracyLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    accuracyValue: {
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
    },
    accuracyProgressBar: {
      height: 10,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
      marginBottom: spacing.xl,
    },
    coinsEarnedBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: withAlpha(theme.coins, 0.1),
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: withAlpha(theme.coins, 0.3),
    },
    coinsEarnedLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    coinsEarnedLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
    },
    coinsEarnedValue: {
      color: theme.coins,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
    },
    buttonsContainer: {
      gap: spacing.md,
    },
    gradientButton: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    gradientButtonInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    gradientButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    secondaryButton: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.surfaceLight,
    },
    secondaryButtonText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
