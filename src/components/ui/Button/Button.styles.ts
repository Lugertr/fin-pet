// src/components/ui/Button/Button.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStylesParams {
  theme: Theme;
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
}

export function createButtonStyles({ theme, variant, size, disabled }: ButtonStylesParams) {
  // Цвета в зависимости от варианта
  const colorsMap: Record<ButtonVariant, { bg: string; text: string }> = {
    primary: { bg: theme.primary, text: theme.onGradient },
    secondary: { bg: theme.surfaceLight, text: theme.textPrimary },
    success: { bg: theme.success, text: theme.onGradient },
    danger: { bg: theme.error, text: theme.onGradient },
    ghost: { bg: 'transparent', text: theme.primary },
  };

  const colors = colorsMap[variant];

  // Размеры в зависимости от size
  const sizesMap: Record<
    ButtonSize,
    { py: number; px: number; fontSize: number; minHeight: number }
  > = {
    sm: { py: spacing.sm, px: spacing.md, fontSize: fontSizes.sm, minHeight: touchTarget.min },
    md: {
      py: spacing.md,
      px: spacing.xl,
      fontSize: fontSizes.md,
      minHeight: touchTarget.recommended,
    },
    lg: { py: spacing.lg, px: spacing.xxl, fontSize: fontSizes.lg, minHeight: 56 },
  };

  const sizes = sizesMap[size];

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.bg,
      borderRadius: radius.lg,
      paddingVertical: sizes.py,
      paddingHorizontal: sizes.px,
      minHeight: sizes.minHeight,
      opacity: disabled ? 0.5 : 1,
    },
    text: {
      color: colors.text,
      fontSize: sizes.fontSize,
      fontWeight: fontWeights.bold,
    },
  });
}
