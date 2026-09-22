// src/components/giftReveal/giftRevealStages.styles.ts
// Общие стили для стадий раскрытия подарка (Unopened/Opening/Choosing/Revealed).
//
// Один файл на все 4 стадии, а не по одному на компонент: UnopenedStage и
// ChoosingStage делят unopenedContainer/title/subtitle, UnopenedStage и
// OpeningStage делят giftBox — реального разделения по компонентам нет,
// дробить смысла не имеет (тот же подход, что в lessonSteps.styles.ts).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface GiftRevealStagesStylesParams {
  theme: Theme;
}

export function createGiftRevealStagesStyles({ theme }: GiftRevealStagesStylesParams) {
  return StyleSheet.create({
    // Общее для Unopened/Choosing
    unopenedContainer: {
      alignItems: 'center',
    },

    // Unopened — контент в ScrollView (flexGrow сохраняет центрирование при
    // коротком содержимом, padding воспроизводит то, что раньше давал
    // родительский gradientContainer), кнопка «Открыть подарок» в
    // ScreenFooter снаружи (см. UnopenedStage.tsx).
    unopenedScrollArea: {
      flex: 1,
    },
    unopenedScrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    title: {
      color: theme.onGradient,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.sm,
    },
    subtitle: {
      color: withAlpha(theme.onGradient, 0.8),
      fontSize: fontSizes.md,
      marginBottom: spacing.xxxl,
      textAlign: 'center',
    },

    // Общее для Unopened/Opening
    giftBox: {
      width: 160,
      height: 160,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxxl,
    },

    // Unopened
    rarityBadge: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      marginBottom: spacing.xxxl,
      borderWidth: 1,
    },
    rarityText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
    },
    openButton: {
      backgroundColor: theme.onGradient,
      paddingHorizontal: spacing.xxxl,
      paddingVertical: spacing.lg,
      borderRadius: radius.xxl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    openButtonText: {
      color: colorPalettes.indigo[600],
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Opening
    openingContainer: {
      alignItems: 'center',
    },

    // Revealed — тот же приём, что у Unopened выше: ScrollView + ScreenFooter
    // снаружи для кнопки «Забрать в инвентарь» (см. RevealedStage.tsx).
    revealedScrollArea: {
      flex: 1,
    },
    revealedScrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    revealedTitle: {
      color: theme.onGradient,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.sm,
    },
    revealedSubtitle: {
      color: withAlpha(theme.onGradient, 0.8),
      fontSize: fontSizes.md,
      marginBottom: spacing.xxxl,
    },
    itemCard: {
      width: 140,
      height: 140,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxl,
    },
    itemName: {
      color: theme.onGradient,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.xs,
    },
    rarityLabel: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      marginBottom: spacing.xxl,
      borderWidth: 1,
    },
    rarityLabelText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
    coinsBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: withAlpha(theme.coins, 0.15),
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: withAlpha(theme.coins, 0.3),
      marginBottom: spacing.xxxl,
    },
    coinsText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    claimButton: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    claimButtonInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    claimButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
