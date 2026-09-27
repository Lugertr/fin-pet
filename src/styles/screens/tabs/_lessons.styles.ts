// src/styles/screens/tabs/_lessons.styles.ts
// Стили самого экрана уроков — контейнер, матрица компетенций, липкая лента
// тем. Стили ленты тем, карточки модуля и дорожки уроков — в
// src/components/lessons/{BranchTabRow,ModuleHeaderCard,LessonPath}/ вместе с
// компонентами.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonsStylesParams {
  theme: Theme;
}

export function createLessonsStyles({ theme }: LessonsStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Матрица компетенций (SpiderChart) — самый верх прокручиваемой области.
    competenceSection: {
      paddingHorizontal: spacing.xxl,
      paddingBottom: spacing.sm,
    },
    // Карточка с паутиной — фон/радиус/рамка от <Card>, здесь только центровка.
    spiderCardInner: {
      alignItems: 'center',
    },
    // Сводка под паутиной: всего пройдено уроков/тем + общая полоса.
    summaryBlock: {
      alignSelf: 'stretch',
      marginTop: spacing.sm,
    },
    summaryText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    overallTrack: {
      height: 8,
      borderRadius: radius.sm,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
      marginTop: spacing.xs,
    },
    overallFill: {
      height: '100%',
      borderRadius: radius.sm,
    },

    // Лента тем прилипает к верху при прокрутке (stickyHeaderIndices) — нужен
    // непрозрачный фон, иначе под ней просвечивала бы уезжающая дорожка.
    stickyTabs: {
      backgroundColor: theme.background,
    },
  });
}
