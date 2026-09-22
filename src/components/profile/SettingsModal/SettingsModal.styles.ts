// src/components/profile/SettingsModal/SettingsModal.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface SettingsModalStylesParams {
  theme: Theme;
}

export function createSettingsModalStyles({ theme }: SettingsModalStylesParams) {
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
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    modalSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxl,
      textAlign: 'center',
    },
    toggleRowsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xxl,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    toggleRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    toggleIconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      marginBottom: spacing.xxs,
    },
    toggleDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
  });
}
