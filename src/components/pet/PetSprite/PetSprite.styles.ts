// src/components/pet/PetSprite/PetSprite.styles.ts
// Стили спрайта питомца

import type { PetMoodState } from '@/constants/petAssets';
import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

interface PetSpriteStylesParams {
  theme: Theme;
  size: number;
  moodState: PetMoodState;
}

export function createPetSpriteStyles({ theme, size, moodState }: PetSpriteStylesParams) {
  // Цвет свечения в зависимости от настроения
  const glowColors: Record<PetMoodState, string> = {
    happy: 'rgba(16, 185, 129, 0.3)',
    neutral: 'rgba(245, 158, 11, 0.3)',
    sad: 'rgba(239, 68, 68, 0.3)',
    sleeping: 'rgba(100, 116, 139, 0.3)',
  };

  // Цвет обводки
  const borderColors: Record<PetMoodState, string> = {
    happy: 'rgba(16, 185, 129, 0.5)',
    neutral: 'rgba(245, 158, 11, 0.5)',
    sad: 'rgba(239, 68, 68, 0.5)',
    sleeping: 'rgba(100, 116, 139, 0.5)',
  };

  return StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: glowColors[moodState],
      borderWidth: 3,
      borderColor: borderColors[moodState],
      overflow: 'visible',
    },
    image: {
      width: size * 0.9,
      height: size * 0.9,
      borderRadius: size / 2,
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
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeSleeping: {
      backgroundColor: theme.surfaceLight,
    },
    badgeHappy: {
      backgroundColor: 'rgba(16, 185, 129, 0.9)',
    },
    badgeEmoji: {
      fontSize: 16,
    },
  });
}
