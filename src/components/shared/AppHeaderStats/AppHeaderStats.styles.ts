// src/components/shared/AppHeaderStats/AppHeaderStats.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AppHeaderStatsStylesParams {
  theme: Theme;
}

export function createAppHeaderStatsStyles({ theme }: AppHeaderStatsStylesParams) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // Лого (или кнопка «назад»/«завершить») + «?» — сжимается первым, если
    // сумма в кошельке длинная и места на узком экране не хватает.
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      flexShrink: 1,
      marginRight: spacing.sm,
    },
    logoText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
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
    walletColumn: {
      alignItems: 'stretch',
      gap: 3,
    },
    pillText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    planStrip: {
      flexDirection: 'row',
      gap: 2,
    },
    planStripSegment: {
      flex: 1,
      height: 4,
      borderRadius: radius.full,
    },
    profileButton: {
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
