// src/components/ui/Badge/Badge.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export type BadgeVariant =
  'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'coins';
export type BadgeSize = 'sm' | 'md';

interface BadgeStylesParams {
  theme: Theme;
  variant: BadgeVariant;
  size: BadgeSize;
}

export function createBadgeStyles({ theme, variant, size }: BadgeStylesParams) {
  const colorsMap: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    primary: {
      bg: withAlpha(theme.primary, 0.125),
      text: theme.primary,
      border: withAlpha(theme.primary, 0.251),
    },
    success: {
      bg: withAlpha(theme.success, 0.125),
      text: theme.success,
      border: withAlpha(theme.success, 0.251),
    },
    warning: {
      bg: withAlpha(theme.warning, 0.125),
      text: theme.warning,
      border: withAlpha(theme.warning, 0.251),
    },
    error: {
      bg: withAlpha(theme.error, 0.125),
      text: theme.error,
      border: withAlpha(theme.error, 0.251),
    },
    info: {
      bg: withAlpha(theme.info, 0.125),
      text: theme.info,
      border: withAlpha(theme.info, 0.251),
    },
    coins: {
      bg: withAlpha(theme.coins, 0.125),
      text: theme.coins,
      border: withAlpha(theme.coins, 0.251),
    },
    neutral: { bg: theme.surfaceLight, text: theme.textSecondary, border: theme.border },
  };

  const colors = colorsMap[variant];
  const isSmall = size === 'sm';

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      backgroundColor: colors.bg,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: isSmall ? spacing.sm : spacing.md,
      paddingVertical: isSmall ? spacing.xs : spacing.sm,
    },
    text: {
      color: colors.text,
      fontSize: isSmall ? fontSizes.xs : fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
  });
}
