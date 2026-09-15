// src/components/ui/Badge/Badge.styles.ts

import type { Theme } from '@/theme';
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
    primary: { bg: `${theme.primary}20`, text: theme.primary, border: `${theme.primary}40` },
    success: { bg: `${theme.success}20`, text: theme.success, border: `${theme.success}40` },
    warning: { bg: `${theme.warning}20`, text: theme.warning, border: `${theme.warning}40` },
    error: { bg: `${theme.error}20`, text: theme.error, border: `${theme.error}40` },
    info: { bg: `${theme.info}20`, text: theme.info, border: `${theme.info}40` },
    coins: { bg: `${theme.coins}20`, text: theme.coins, border: `${theme.coins}40` },
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
