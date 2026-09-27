// styles/screens/tabs/_savings.styles.ts
// Стили вкладки «Копилка» (§11 ТЗ, макет 27.09.2026). Карточки — в своих
// компонентах (components/savings: SavingsGoalCard, SavingsBucketRow,
// SavingsAmountModal, GoalPickerModal); здесь только каркас экрана.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, radius, spacing } from '@/theme/tokens';
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
    // Пояснение внизу экрана, над таб-баром (как в макете).
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: withAlpha(theme.primary, 0.1),
    },
    infoBannerText: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
  });
}
