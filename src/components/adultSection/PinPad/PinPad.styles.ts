// src/components/adultSection/PinPad/PinPad.styles.ts
// Стили цифровой клавиатуры PIN-кода родительского раздела.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PinPadStylesParams {
  theme: Theme;
}

export function createPinPadStyles({ theme }: PinPadStylesParams) {
  return StyleSheet.create({
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.md,
      marginBottom: spacing.xxl,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: 'transparent',
    },
    dotFilled: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    dotError: {
      backgroundColor: theme.error,
      borderColor: theme.error,
    },
    keypad: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: 3 * 72 + 2 * spacing.lg,
      alignSelf: 'center',
      gap: spacing.lg,
    },
    key: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyEmpty: {
      backgroundColor: 'transparent',
    },
    keyText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xxl,
    },
  });
}
