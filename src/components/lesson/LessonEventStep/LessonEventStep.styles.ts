// src/components/lesson/LessonEventStep/LessonEventStep.styles.ts
// Стили события урока (раньше — модалка событий по времени, удалена вместе с ними).

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonEventStepStylesParams {
  theme: Theme;
}

export function createLessonEventStepStyles({ theme }: LessonEventStepStylesParams) {
  return StyleSheet.create({
    icon: {
      textAlign: 'center',
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    description: {
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    budgetRow: {
      alignSelf: 'center',
      marginBottom: spacing.lg,
    },
    budgetText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    optionButton: {
      // §23: тап-зона ≥48×48dp — раньше высота зависела только от паддинга
      // (spacing.md) вокруг мелкого (sm) текста и не гарантировала минимум.
      minHeight: touchTarget.recommended,
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.surfaceLight,
    },
    optionButtonDisabled: {
      opacity: 0.4,
    },
    optionLabel: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      // §23: основной текст ≥16sp — это и есть тот текст, между которым
      // ребёнок реально выбирает, раньше был sm (12), как второстепенная подпись.
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    // Второстепенная подпись под текстом варианта («Не хватает N C»).
    optionHint: {
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xxs,
    },
    // Эффекты варианта из данных: монеты (CoinAmount) и время — под подписью.
    effectsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xxs,
    },
    effectTime: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
    },
    effectText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
  });
}
