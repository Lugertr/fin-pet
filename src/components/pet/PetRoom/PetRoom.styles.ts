// src/components/pet/PetRoom/PetRoom.styles.ts
// Стили комнаты питомца

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PetRoomStylesParams {
  theme: Theme;
  roomHeight: number;
}

export function createPetRoomStyles({ theme, roomHeight }: PetRoomStylesParams) {
  return StyleSheet.create({
    container: {
      borderRadius: radius.xxl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    background: {
      width: '100%',
      height: roomHeight,
      backgroundColor: theme.surface,
    },
    decorLeft: {
      position: 'absolute',
      left: spacing.lg,
      bottom: 60,
      flexDirection: 'column',
      gap: spacing.sm,
    },
    decorRight: {
      position: 'absolute',
      right: spacing.lg,
      bottom: 60,
      flexDirection: 'column',
      gap: spacing.sm,
    },
    petContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    petNameBadge: {
      marginTop: spacing.md,
      backgroundColor: 'rgba(0,0,0,0.4)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },
    petNameText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    moodIndicatorContainer: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.md,
    },
    decorItemContainer: {
      width: 60,
      height: 60,
      borderRadius: radius.lg,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    decorItemImage: {
      width: 48,
      height: 48,
    },
    decorItemEmoji: {
      fontSize: 32,
    },
  });
}
