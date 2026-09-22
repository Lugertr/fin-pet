// src/components/profile/ParentZoneCard/ParentZoneCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ParentZoneCardStylesParams {
  theme: Theme;
}

export function createParentZoneCardStyles({ theme }: ParentZoneCardStylesParams) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: withAlpha(theme.textSecondary, 0.15),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    textCol: {
      flex: 1,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      marginBottom: spacing.xxs,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
  });
}
