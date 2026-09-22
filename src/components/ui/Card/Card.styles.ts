// src/components/ui/Card/Card.styles.ts

import type { Theme } from '@/theme';
import { radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardStylesParams {
  theme: Theme;
  variant: CardVariant;
  padding: CardPadding;
  /** useResponsive().scale — подгоняет padding/radius под ширину экрана, тем
   * же приёмом, что уже применяется вручную во всех карточках-предметах
   * (ShopItemCard, InventoryItemCard и т.п.), которые Card заменяет. */
  scale: (size: number) => number;
}

export function createCardStyles({ theme, variant, padding, scale }: CardStylesParams) {
  const paddingMap: Record<CardPadding, number> = {
    none: 0,
    sm: spacing.sm,
    md: spacing.lg,
    lg: spacing.xxl,
  };

  const paddingValue = scale(paddingMap[padding]);

  const baseStyle = {
    borderRadius: scale(radius.xl),
    padding: paddingValue,
    overflow: 'hidden' as const,
  };

  const variantStyles: Record<CardVariant, object> = {
    default: {
      ...baseStyle,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    elevated: {
      ...baseStyle,
      backgroundColor: theme.surfaceElevated,
      ...shadows.md,
    },
    outlined: {
      ...baseStyle,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
    },
  };

  return StyleSheet.create({
    container: variantStyles[variant],
  });
}
