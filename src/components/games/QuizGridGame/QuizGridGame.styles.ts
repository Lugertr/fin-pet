// src/components/games/QuizGridGame/QuizGridGame.styles.ts
// Стили сетки 2×2 для викторины с явной кнопкой «Проверить» (TestStep)

import type { Theme } from '@/theme';
import { circleRadius, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface QuizGridGameStylesParams {
  theme: Theme;
}

export function createQuizGridGameStyles({ theme }: QuizGridGameStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    questionCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    questionText: {
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      lineHeight: 24,
    },
    hintText: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
      marginTop: spacing.xs,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    optionCard: {
      width: '47%',
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 2,
      position: 'relative',
    },
    optionIconCircle: {
      width: 40,
      height: 40,
      borderRadius: circleRadius(40),
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    optionLabel: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxs,
    },
    optionSublabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.xs,
    },
    optionCheckBadge: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 22,
      height: 22,
      borderRadius: circleRadius(22),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
    },
    submitButton: {
      borderRadius: radius.lg,
      alignItems: 'center',
      backgroundColor: theme.accent,
    },
    submitButtonDisabled: {
      backgroundColor: theme.surfaceLight,
      opacity: 0.6,
    },
    submitButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    feedbackContainer: {
      marginTop: spacing.lg,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
    },
    feedbackText: {
      textAlign: 'center',
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
  });
}
