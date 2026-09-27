// src/components/pet/PetSprite/PetSprite.styles.ts
// Стили спрайта питомца — без декоративного фона/обводки вокруг картинки
// (по решению пользователя), контейнер только задаёт реальные пропорции
// (width/height считаются в PetSprite.tsx из getAssetAspectRatio).

import type { Theme } from '@/theme';
import { circleRadius } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PetSpriteStylesParams {
  theme: Theme;
  width: number;
  height: number;
}

export function createPetSpriteStyles({ theme, width, height }: PetSpriteStylesParams) {
  return StyleSheet.create({
    container: {
      width,
      height,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    emoji: {
      fontSize: width * 0.5,
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
    badgeEmoji: {
      fontSize: 16,
    },
  });
}
