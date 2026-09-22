// src/components/ui/IconButton/IconButton.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export type IconButtonVariant = 'onGradient' | 'surface' | 'outlined';

interface IconButtonStylesParams {
  theme: Theme;
  variant: IconButtonVariant;
  size: number;
}

export function createIconButtonStyles({ theme, variant, size }: IconButtonStylesParams) {
  const backgroundColor =
    variant === 'onGradient'
      ? withAlpha(theme.onGradient, 0.2)
      : variant === 'outlined'
        ? theme.surface
        : theme.surfaceLight;

  return StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: circleRadius(size),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor,
      ...(variant === 'outlined' ? { borderWidth: 1, borderColor: theme.borderLight } : {}),
    },
  });
}
