// src/components/lessons/GiftPathNode/GiftPathNode.styles.ts

import type { Theme } from '@/theme';
import { radius } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface GiftPathNodeStylesParams {
  theme: Theme;
  size: number;
}

export function createGiftPathNodeStyles({ theme, size }: GiftPathNodeStylesParams) {
  return StyleSheet.create({
    box: {
      width: size,
      height: size,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxAvailable: {
      backgroundColor: theme.coins,
      shadowColor: theme.coins,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    boxClaimed: {
      backgroundColor: theme.surfaceLight,
    },
    boxLocked: {
      backgroundColor: theme.surfaceLight,
      opacity: 0.5,
    },
  });
}
