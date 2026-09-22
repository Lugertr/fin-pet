// src/components/inventory/ItemDetailModal/ItemDetailModal.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ItemDetailModalStylesParams {
  theme: Theme;
}

export function createItemDetailModalStyles({ theme }: ItemDetailModalStylesParams) {
  return StyleSheet.create({
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
    modalHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    modalItemIcon: {
      width: 80,
      height: 80,
      borderRadius: radius.xxl,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    modalItemName: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.xs,
    },
    modalItemDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    modalStatsCard: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.xxl,
    },
    modalStatRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    modalStatLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    modalStatValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    modalStatValueSuccess: {
      color: theme.success,
    },
    modalButtonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    modalActionButton: {
      flex: 1,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    modalActionText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    modalCloseButton: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    modalCloseText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
  });
}
