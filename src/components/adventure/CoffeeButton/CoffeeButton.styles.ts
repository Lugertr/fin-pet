// src/components/adventure/CoffeeButton/CoffeeButton.styles.ts
// Цвета — из палитры, а не из темы: кнопка лежит на светлой сцене (work.svg)
// и в тёмной теме тоже должна быть светлой.

import { colorPalettes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createCoffeeButtonStyles() {
  return StyleSheet.create({
    button: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      borderWidth: 1.5,
      borderColor: colorPalettes.amber[200],
      backgroundColor: colorPalettes.amber[50],
      ...shadows.md,
    },
    buttonUsed: {
      borderColor: colorPalettes.slate[200],
      backgroundColor: colorPalettes.slate[50],
      opacity: 0.85,
    },
    iconCircle: {
      borderRadius: radius.full,
      backgroundColor: colorPalettes.amber[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleUsed: {
      backgroundColor: colorPalettes.slate[200],
    },
    label: {
      color: colorPalettes.slate[900],
      fontWeight: fontWeights.bold,
      textAlign: 'center',
    },
    usedHint: {
      color: colorPalettes.slate[600],
      textAlign: 'center',
    },
    chips: {
      flexDirection: 'row',
      gap: spacing.xxs,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.full,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
    },
    chipText: {
      fontWeight: fontWeights.bold,
    },
    priceChip: {
      backgroundColor: colorPalettes.amber[100],
    },
    priceText: {
      color: colorPalettes.amber[800],
    },
    energyChip: {
      backgroundColor: colorPalettes.orange[100],
    },
    energyText: {
      color: colorPalettes.orange[700],
    },
  });
}
