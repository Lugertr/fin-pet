// src/styles/screens/tabs/_profile.styles.ts
// Стили экрана «Прогресс» — только раскладка. Карточки — в
// src/components/profile/profileCards.styles.ts.

import type { Theme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ProfileStylesParams {
  theme: Theme;
}

export function createProfileStyles({ theme }: ProfileStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      gap: spacing.lg,
    },
  });
}
