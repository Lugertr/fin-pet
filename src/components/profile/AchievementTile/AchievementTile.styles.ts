// src/components/profile/AchievementTile/AchievementTile.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createAchievementTileStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    tile: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadows.sm,
    },
    // Закрытое — пунктирная рамка и без тени (макет S32).
    tileLocked: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: theme.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    tileBody: {
      gap: spacing.sm,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    titleLocked: {
      color: theme.textSecondary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    caption: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    claimButton: {
      minHeight: touchTarget.recommended,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
      marginTop: 'auto',
    },
    claimText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
  });
}
