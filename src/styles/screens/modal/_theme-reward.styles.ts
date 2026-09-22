// src/app/(modal)/theme-reward.styles.ts
// Стили самого экрана: контейнер, фон-градиент, состояние "подарок не найден".
// Стили стадий раскрытия (unopened/opening/choosing/revealed) переехали в
// src/components/giftReveal/giftRevealStages.styles.ts вместе с компонентами.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ThemeRewardStylesParams {
  theme: Theme;
}

export function createThemeRewardStyles({ theme }: ThemeRewardStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    // unopened/revealed сами управляют своей раскладкой (ScrollView +
    // ScreenFooter — см. UnopenedStage/RevealedStage), поэтому здесь только
    // flex:1 без центрирования/паддинга. opening/choosing кнопки не имеют и
    // по-прежнему просто центрируются как раньше — через centeredStageWrap.
    gradientContainer: {
      flex: 1,
    },
    centeredStageWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },

    // Экран "подарок не найден"
    notFoundContainer: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    notFoundTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    notFoundText: {
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    notFoundButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    notFoundButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.semibold,
    },
  });
}
