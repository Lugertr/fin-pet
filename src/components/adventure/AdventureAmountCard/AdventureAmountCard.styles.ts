// src/components/adventure/AdventureAmountCard/AdventureAmountCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createAdventureAmountCardStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.xxl,
      backgroundColor: withAlpha(theme.primary, 0.06),
    },
    iconBox: {
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      gap: 2,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    amountChip: {
      backgroundColor: withAlpha(theme.coins, 0.25),
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    amountText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    line: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
  });
}
