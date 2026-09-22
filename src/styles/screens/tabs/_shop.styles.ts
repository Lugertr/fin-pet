// src/app/(tabs)/shop.styles.ts
// Стили самого экрана магазина — шапка, баннер подарков, категории, список.
// Стили карточки товара переехали в
// src/components/shop/ShopItemCard/ShopItemCard.styles.ts вместе с компонентом.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, emojiSizes, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ShopStylesParams {
  theme: Theme;
}

export function createShopStyles({ theme }: ShopStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Заголовок
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.xxs,
    },
    inventoryButton: {
      width: 44,
      height: 44,
      borderRadius: circleRadius(44),
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inventoryBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 18,
      height: 18,
      borderRadius: circleRadius(18),
      backgroundColor: theme.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inventoryBadgeText: {
      color: theme.onGradient,
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.bold,
    },

    // Баннер подарков
    giftsBanner: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    giftsBannerInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    giftsIconBox: {
      width: 44,
      height: 44,
      borderRadius: circleRadius(44),
      backgroundColor: withAlpha(theme.onGradient, 0.25),
      alignItems: 'center',
      justifyContent: 'center',
    },
    giftsTextContainer: {
      flex: 1,
    },
    giftsTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    giftsSubtitle: {
      color: withAlpha(theme.onGradient, 0.85),
      fontSize: fontSizes.sm,
    },

    // Список товаров
    itemsScroll: {
      flex: 1,
    },
    itemsScrollContent: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.massive,
    },
    emptyEmoji: {
      fontSize: emojiSizes.xxl,
      marginBottom: spacing.lg,
    },
    emptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
}
