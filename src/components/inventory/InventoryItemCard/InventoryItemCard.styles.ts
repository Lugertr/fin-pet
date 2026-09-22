// src/components/inventory/InventoryItemCard/InventoryItemCard.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface InventoryItemCardStylesParams {
  theme: Theme;
}

export function createInventoryItemCardStyles({ theme }: InventoryItemCardStylesParams) {
  return StyleSheet.create({
    // Фон/паддинг/радиус/рамка — от <Card padding="md"> (src/components/ui/Card).
    itemCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIconBox: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    itemQuantityBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: theme.primary,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      minWidth: 20,
      alignItems: 'center',
    },
    itemQuantityText: {
      color: theme.onGradient,
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.bold,
    },
    itemInfoContainer: {
      flex: 1,
    },
    itemNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    itemName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    itemDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
  });
}
