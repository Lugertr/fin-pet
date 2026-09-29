// src/components/savings/SavingsHeader/SavingsHeader.styles.ts
// Плашка суммы и кнопка профиля — как в общей шапке (AppHeaderStats.styles).

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createSavingsHeaderStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // «Назад» + заголовок + «?» — сжимается первым на узком экране.
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexShrink: 1,
      marginRight: spacing.sm,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
      flexShrink: 1,
    },
    rightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.full,
      paddingVertical: spacing.xxs,
    },
    pillText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    profileButton: {
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
