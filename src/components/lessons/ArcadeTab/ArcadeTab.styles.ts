// src/components/lessons/ArcadeTab/ArcadeTab.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { emojiSizes, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ArcadeTabStylesParams {
  theme: Theme;
}

export function createArcadeTabStyles({ theme }: ArcadeTabStylesParams) {
  return StyleSheet.create({
    arcadeEmptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxxl,
    },
    arcadeEmptyEmoji: {
      fontSize: emojiSizes.xxl,
      marginBottom: spacing.lg,
    },
    arcadeEmptyTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    arcadeEmptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    arcadeScroll: {
      flex: 1,
    },
    arcadeScrollContent: {
      padding: spacing.lg,
    },
    arcadeInfoBanner: {
      backgroundColor: withAlpha(theme.accent, 0.1),
      borderWidth: 1,
      borderColor: withAlpha(theme.accent, 0.3),
      borderRadius: radius.lg,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    arcadeInfoText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      flex: 1,
      lineHeight: 18,
    },
    arcadeList: {
      gap: spacing.md,
    },
  });
}
