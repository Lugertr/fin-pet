// src/components/ui/Card/Card.styles.ts

import type { Theme } from '@/theme';
import { radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardStylesParams {
  theme: Theme;
  variant: CardVariant;
  padding: CardPadding;
}

export function createCardStyles({ theme, variant, padding }: CardStylesParams) {
  const paddingMap: Record<CardPadding, number> = {
    none: 0,
    sm: spacing.sm,
    md: spacing.lg,
    lg: spacing.xxl,
  };

  const paddingValue = paddingMap[padding];

  const baseStyle = {
    borderRadius: radius.xl,
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
    gradient: {
      ...baseStyle,
      backgroundColor: 'transparent',
    },
  };

  return StyleSheet.create({
    container: variantStyles[variant],
    innerGradient: {
      borderRadius: radius.xl,
      padding: paddingValue,
    },
  });
}
