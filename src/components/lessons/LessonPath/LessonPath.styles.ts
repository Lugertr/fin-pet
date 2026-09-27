// src/components/lessons/LessonPath/LessonPath.styles.ts

import type { Theme } from '@/theme';
import { emojiSizes, fontSizes, fontWeights, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonPathStylesParams {
  theme: Theme;
}

export function createLessonPathStyles({ theme }: LessonPathStylesParams) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
      paddingTop: spacing.sm,
    },
    pathContainer: {
      position: 'relative',
    },
    svgLayer: {
      position: 'absolute',
      left: 0,
      top: 0,
    },
    nodeSlot: {
      position: 'absolute',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.massive,
    },
    emptyEmoji: {
      fontSize: emojiSizes.xxl,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
}
