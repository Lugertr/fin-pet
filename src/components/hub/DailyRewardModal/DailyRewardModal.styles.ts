// src/components/hub/DailyRewardModal/DailyRewardModal.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createDailyRewardModalStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      overflow: 'hidden',
    },
    hero: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      gap: spacing.xs,
    },
    heroTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
      textAlign: 'center',
    },
    heroSubtitle: {
      color: theme.onGradient,
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    body: {
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.lg,
    },
    bonusText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.title,
    },
    streakRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
    },
    hint: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    claimButton: {
      alignSelf: 'stretch',
      minHeight: touchTarget.recommended,
      borderRadius: radius.lg,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
    },
    claimText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
