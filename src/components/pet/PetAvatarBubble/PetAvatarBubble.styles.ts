// src/components/pet/PetAvatarBubble/PetAvatarBubble.styles.ts

import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

interface PetAvatarBubbleStylesParams {
  theme: Theme;
  size: number;
}

export function createPetAvatarBubbleStyles({ theme, size }: PetAvatarBubbleStylesParams) {
  return StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
      overflow: 'visible',
    },
    image: {
      width: size * 0.7,
      height: size * 0.7,
    },
    emoji: {
      fontSize: size * 0.5,
    },
    badge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: size * 0.36,
      height: size * 0.36,
      borderRadius: (size * 0.36) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: theme.background,
    },
    badgeEmoji: {
      fontSize: size * 0.2,
    },
  });
}
