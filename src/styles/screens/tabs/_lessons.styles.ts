// src/styles/screens/tabs/_lessons.styles.ts
// Стили самого экрана уроков — контейнер, шапка. Стили ряда вкладок веток,
// карточки модуля и дорожки уроков переехали в
// src/components/lessons/{BranchTabRow,ModuleHeaderCard,LessonPath}/ вместе с
// компонентами.

import type { Theme } from '@/theme';
import { spacing } from '@/theme/tokens';
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

    // Заголовок
    header: {
      paddingTop: 56,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.xxl,
    },
  });
}
