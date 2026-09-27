// src/components/savings/GoalPickerModal/GoalPickerModal.styles.ts
// Стили модалки выбора цели накопления (карточки — GoalOptionCard).

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
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContent: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      backgroundColor: theme.background,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      padding: spacing.xl,
      maxHeight: '80%',
    },
    modalTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    modalSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    savedNote: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      marginTop: -spacing.sm,
      marginBottom: spacing.lg,
    },
    // Отступ сверху/справа — под галочку выбранной карточки (она торчит за край).
    list: {
      gap: spacing.md,
      paddingTop: spacing.sm,
      paddingRight: spacing.sm,
      paddingBottom: spacing.md,
    },
  });
}
