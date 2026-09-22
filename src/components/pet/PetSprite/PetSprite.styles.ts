// src/components/pet/PetSprite/PetSprite.styles.ts
// Стили спрайта питомца

import type { PetMoodState } from '@/constants/petAssets';
import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, colorPalettes } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PetSpriteStylesParams {
  theme: Theme;
  size: number;
  moodState: PetMoodState;
}

export function createPetSpriteStyles({ theme, size, moodState }: PetSpriteStylesParams) {
  // Цвет свечения в зависимости от настроения — фиксированный оттенок палитры,
  // не theme.X: иначе свечение незаметно сдвигалось бы между темами.
  const glowColors: Record<PetMoodState, string> = {
    happy: withAlpha(colorPalettes.emerald[500], 0.3),
    neutral: withAlpha(colorPalettes.amber[500], 0.3),
    sad: withAlpha(colorPalettes.red[500], 0.3),
    sleeping: withAlpha(colorPalettes.slate[500], 0.3),
  };

  // Цвет обводки
  const borderColors: Record<PetMoodState, string> = {
    happy: withAlpha(colorPalettes.emerald[500], 0.5),
    neutral: withAlpha(colorPalettes.amber[500], 0.5),
    sad: withAlpha(colorPalettes.red[500], 0.5),
    sleeping: withAlpha(colorPalettes.slate[500], 0.5),
  };

  return StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: circleRadius(size),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: glowColors[moodState],
      borderWidth: 3,
      borderColor: borderColors[moodState],
      overflow: 'visible',
    },
    // Без borderRadius: артборд питомца — портретный (200x300, не квадрат),
    // contentFit="contain" вписывает его в квадрат с прозрачными полями
    // сверху/снизу; круглая обрезка поверх обрезала бы антенну/уши/ноги по
    // бокам там, где рисунок шире вписанной окружности.
    image: {
      width: size * 0.9,
      height: size * 0.9,
    },
    emoji: {
      fontSize: size * 0.5,
    },
    badge: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 32,
      height: 32,
      borderRadius: circleRadius(32),
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeSleeping: {
      backgroundColor: theme.surfaceLight,
    },
    badgeHappy: {
      backgroundColor: withAlpha(colorPalettes.emerald[500], 0.9),
    },
    badgeEmoji: {
      fontSize: 16,
    },
  });
}
