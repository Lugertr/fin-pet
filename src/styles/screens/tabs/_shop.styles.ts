// src/app/(tabs)/shop.styles.ts
// Стили экрана магазина

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
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
    subtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    headerActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    balanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    balanceText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    inventoryButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
      borderRadius: 9,
      backgroundColor: theme.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inventoryBadgeText: {
      color: '#FFFFFF',
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
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    giftsTextContainer: {
      flex: 1,
    },
    giftsTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    giftsSubtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: fontSizes.sm,
    },

    // Категории
    categoriesScroll: {
      flexGrow: 0,
    },
    categoriesRow: {
      gap: spacing.sm,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
    },
    categoryButtonActive: {
      backgroundColor: theme.primary,
    },
    categoryButtonInactive: {
      backgroundColor: theme.surfaceLight,
    },
    categoryText: {
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.md,
    },
    categoryTextActive: {
      color: '#FFFFFF',
    },
    categoryTextInactive: {
      color: theme.textSecondary,
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
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    emptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
    },

    // Карточка товара
    itemCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIconBox: {
      width: 64,
      height: 64,
      borderRadius: radius.lg,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    itemEmoji: {
      fontSize: 32,
    },
    itemInfoContainer: {
      flex: 1,
    },
    itemName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      marginBottom: spacing.xs,
    },
    itemDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginBottom: spacing.xs,
    },
    itemPriceContainer: {
      alignItems: 'flex-end',
    },
    itemPrice: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      marginBottom: spacing.sm,
    },
    itemPriceAffordable: {
      color: theme.coins,
    },
    itemPriceNotAffordable: {
      color: theme.error,
    },
    buyButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    buyButtonEnabled: {
      backgroundColor: theme.primary,
    },
    buyButtonDisabled: {
      backgroundColor: theme.surfaceLight,
      opacity: 0.5,
    },
    buyButtonText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
  });
}
