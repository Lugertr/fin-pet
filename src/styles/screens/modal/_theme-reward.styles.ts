// src/app/(modal)/theme-reward.styles.ts
// Стили экрана открытия подарков

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
    gradientContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },

    // Этап 1: Неоткрытый подарок
    unopenedContainer: {
      alignItems: 'center',
    },
    title: {
      color: '#FFFFFF',
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.sm,
    },
    subtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.md,
      marginBottom: spacing.xxxl,
      textAlign: 'center',
    },
    giftBox: {
      width: 160,
      height: 160,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxxl,
    },
    giftEmoji: {
      fontSize: 80,
    },
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
      backgroundColor: '#FFFFFF',
      paddingHorizontal: spacing.xxxl,
      paddingVertical: spacing.lg,
      borderRadius: radius.xxl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    openButtonText: {
      color: '#4F46E5',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Этап 2: Анимация открытия
    openingContainer: {
      alignItems: 'center',
    },

    // Этап 3: Результат
    revealedContainer: {
      alignItems: 'center',
      width: '100%',
    },
    revealedTitle: {
      color: '#FFFFFF',
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.sm,
    },
    revealedSubtitle: {
      color: 'rgba(255,255,255,0.8)',
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
    itemEmoji: {
      fontSize: 72,
    },
    itemName: {
      color: '#FFFFFF',
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
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
      marginBottom: spacing.xxxl,
    },
    coinsText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    claimButton: {
      width: '100%',
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
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Экран "подарок не найден"
    notFoundContainer: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    notFoundEmoji: {
      fontSize: 64,
      marginBottom: spacing.lg,
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
      color: '#FFFFFF',
      fontWeight: fontWeights.semibold,
    },
  });
}
