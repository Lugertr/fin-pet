// src/components/adventure/ShiftLevelModal/ShiftLevelModal.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createShiftLevelModalStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '100%',
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
      gap: spacing.md,
    },
    levelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    levelTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    barTrack: {
      height: 16,
      borderRadius: radius.full,
      backgroundColor: withAlpha(theme.primary, 0.15),
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    hint: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    closeButton: {
      minHeight: touchTarget.recommended,
      borderRadius: radius.lg,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      marginTop: spacing.sm,
    },
    closeText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
