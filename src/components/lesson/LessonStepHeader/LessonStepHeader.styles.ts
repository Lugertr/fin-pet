// src/components/lesson/LessonStepHeader/LessonStepHeader.styles.ts

import type { Theme } from '@/theme';
import { radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonStepHeaderStylesParams {
  theme: Theme;
}

export function createLessonStepHeaderStyles({ theme }: LessonStepHeaderStylesParams) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: 56,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
      backgroundColor: theme.background,
    },
    progressTrack: {
      flex: 1,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    progressFill: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: theme.success,
    },
    moodBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
    },
  });
}
