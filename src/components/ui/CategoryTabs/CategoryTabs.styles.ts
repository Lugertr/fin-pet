// src/components/ui/CategoryTabs/CategoryTabs.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface CategoryTabsStylesParams {
  theme: Theme;
}

export function createCategoryTabsStyles({ theme }: CategoryTabsStylesParams) {
  return StyleSheet.create({
    row: {
      gap: spacing.sm,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.xl,
    },
    tabActive: {
      backgroundColor: theme.primary,
    },
    tabInactive: {
      backgroundColor: theme.surfaceLight,
    },
    text: {
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.md,
    },
    textActive: {
      color: theme.onGradient,
    },
    textInactive: {
      color: theme.textSecondary,
    },
  });
}
