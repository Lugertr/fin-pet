// src/components/pet/MoodIndicator/MoodIndicator.styles.ts
// Стили индикатора настроения

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface MoodIndicatorStylesParams {
  theme: Theme;
  moodColor: string;
  tipColor: string;
}

export function createMoodIndicatorStyles({
  theme,
  moodColor,
  tipColor,
}: MoodIndicatorStylesParams) {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    label: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    moodBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: `${moodColor}20`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },
    moodEmoji: {
      fontSize: fontSizes.lg,
    },
    moodText: {
      color: moodColor,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    barContainer: {
      height: 12,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.full,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    tipContainer: {
      marginTop: spacing.md,
      backgroundColor: `${tipColor}15`,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: `${tipColor}40`,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    tipText: {
      color: tipColor,
      fontSize: fontSizes.sm,
      flex: 1,
      lineHeight: 18,
    },
  });
}
