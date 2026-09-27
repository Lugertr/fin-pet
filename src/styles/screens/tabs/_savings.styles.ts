// styles/screens/tabs/_savings.styles.ts
// Стили вкладки «Копилка» (§11 ТЗ, макет 27.09.2026). Карточки — в своих
// компонентах (components/savings: SavingsGoalCard, SavingsBucketRow,
// SavingsHistory, SavingsAmountModal, GoalPickerModal); здесь только каркас экрана.

import type { Theme } from '@/theme';
import { spacing } from '@/theme/tokens';
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
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
  });
}
