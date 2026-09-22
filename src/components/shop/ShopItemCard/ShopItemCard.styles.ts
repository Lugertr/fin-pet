// src/components/shop/ShopItemCard/ShopItemCard.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ShopItemCardStylesParams {
  theme: Theme;
}

export function createShopItemCardStyles({ theme }: ShopItemCardStylesParams) {
  return StyleSheet.create({
    // Фон/паддинг/радиус/рамка теперь даёт <Card variant="default" padding="md">
    // (src/components/ui/Card) — здесь только внутренняя раскладка строки.
    itemCardRow: {
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
      color: theme.onGradient,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
  });
}
