// src/components/savings/GoalOptionCard/GoalOptionCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes, fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createGoalOptionCardStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 72,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.xxl,
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      ...shadows.sm,
    },
    cardSelected: {
      borderColor: theme.primary,
    },
    imageBox: {
      width: 52,
      height: 52,
      borderRadius: radius.lg,
      backgroundColor: withAlpha(colorPalettes.emerald[500], 0.15),
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
    },
    name: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    caption: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginTop: 2,
    },
    price: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    check: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 26,
      height: 26,
      borderRadius: radius.full,
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
