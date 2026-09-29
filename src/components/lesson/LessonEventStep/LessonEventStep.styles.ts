// src/components/lesson/LessonEventStep/LessonEventStep.styles.ts
// Стили события урока — окно по макету (29.09.2026): затемнённый фон,
// карточка с плашкой «Событие», иконкой, вариантами и превью плана.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonEventStepStylesParams {
  theme: Theme;
}

export function createLessonEventStepStyles({ theme }: LessonEventStepStylesParams) {
  return StyleSheet.create({
    backdrop: {
      backgroundColor: theme.overlay,
    },
    backdropContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    // Ширина — как у окна на телефоне: на планшете и вебе карточка не
    // растягивается на весь экран.
    card: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      gap: spacing.sm,
      ...shadows.lg,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.warning,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    badgeText: {
      color: theme.onWarning,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
    },
    iconBox: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xs,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    description: {
      color: theme.textSecondary,
      textAlign: 'center',
    },
    options: {
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    optionsRow: {
      flexDirection: 'row',
    },
    optionButton: {
      // §23: тап-зона ≥48×48dp.
      minHeight: touchTarget.recommended,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
    },
    optionInRow: {
      flex: 1,
    },
    optionMain: {
      backgroundColor: theme.primary,
    },
    optionSecondary: {
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
    optionButtonDisabled: {
      opacity: 0.4,
    },
    optionLabel: {
      // §23: основной текст ≥16sp — между этими подписями ребёнок и выбирает.
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    optionLabelMain: {
      color: theme.onGradient,
    },
    optionLabelSecondary: {
      color: theme.textPrimary,
    },
    // «Не хватает N C» под подписью варианта.
    optionHint: {
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xxs,
    },
    // Как главный вариант ляжет на план работы.
    preview: {
      marginTop: spacing.sm,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    previewTitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    previewNote: {
      color: theme.textSecondary,
      textAlign: 'center',
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    previewLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexShrink: 1,
    },
    previewLabel: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
    },
    previewValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      flexShrink: 1,
      textAlign: 'right',
    },
    previewHint: {
      color: theme.textSecondary,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: radius.full,
    },
    deltaChip: {
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
    },
    deltaText: {
      fontWeight: fontWeights.bold,
    },
    barTrack: {
      flexDirection: 'row',
      height: 8,
      borderRadius: radius.full,
      backgroundColor: theme.border,
      overflow: 'hidden',
      marginVertical: spacing.xs,
    },
    barFill: {
      height: '100%',
    },
  });
}
