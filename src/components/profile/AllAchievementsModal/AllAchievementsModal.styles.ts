// src/components/profile/AllAchievementsModal/AllAchievementsModal.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AllAchievementsModalStylesParams {
  theme: Theme;
}

export function createAllAchievementsModalStyles({ theme }: AllAchievementsModalStylesParams) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: radius.xxxl,
      borderTopRightRadius: radius.xxxl,
      padding: spacing.xxl,
      paddingTop: spacing.xxxl,
    },
    modalTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      justifyContent: 'center',
    },
  });
}
