// src/components/games/QuizGame/QuizGame.styles.ts
// Стили викторины

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface QuizGameStylesParams {
  theme: Theme;
}

export function createQuizGameStyles({ theme }: QuizGameStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    questionCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      marginBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    questionText: {
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      lineHeight: 26,
    },
    optionsContainer: {
      gap: spacing.md,
    },
    optionButton: {
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionLetterCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    optionLetterText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    optionText: {
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      flex: 1,
      lineHeight: 22,
    },
    optionIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionIconText: {
      color: '#FFFFFF',
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
    },
    feedbackContainer: {
      marginTop: spacing.xxl,
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

/**
 * Состояния вариантов ответа
 */
export type OptionState = 'idle' | 'correct' | 'selectedWrong' | 'dimmed';

/**
 * Цвета для каждого состояния варианта
 */
export function getOptionColors(
  theme: Theme,
  state: OptionState
): { bg: string; border: string; opacity: number } {
  switch (state) {
    case 'idle':
      return {
        bg: theme.surfaceLight,
        border: theme.borderLight,
        opacity: 1,
      };
    case 'correct':
      return {
        bg: 'rgba(16, 185, 129, 0.2)',
        border: theme.success,
        opacity: 1,
      };
    case 'selectedWrong':
      return {
        bg: 'rgba(239, 68, 68, 0.2)',
        border: theme.error,
        opacity: 1,
      };
    case 'dimmed':
      return {
        bg: theme.surfaceLight,
        border: theme.borderLight,
        opacity: 0.5,
      };
  }
}
