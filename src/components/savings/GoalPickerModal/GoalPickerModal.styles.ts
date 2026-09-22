// src/components/savings/GoalPickerModal/GoalPickerModal.styles.ts
// Стили модалки выбора цели накопления.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface GoalPickerModalStylesParams {
  theme: Theme;
}

export function createGoalPickerModalStyles({ theme }: GoalPickerModalStylesParams) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      padding: spacing.xl,
      maxHeight: '75%',
    },
    modalTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.lg,
    },
    goalItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    goalItemIcon: {
      fontSize: 28,
    },
    goalItemName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    goalItemPrice: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
  });
}
