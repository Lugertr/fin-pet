// src/components/shared/AlertHost/AlertHost.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AlertHostStylesParams {
  theme: Theme;
}

export function createAlertHostStyles({ theme }: AlertHostStylesParams) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.xl,
    },
    title: {
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    message: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    buttonsColumn: {
      gap: spacing.sm,
    },
    button: {
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    buttonDefault: {
      backgroundColor: theme.accent,
    },
    buttonCancel: {
      backgroundColor: theme.surfaceLight,
    },
    buttonDestructive: {
      backgroundColor: theme.error,
    },
    buttonText: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    buttonTextDefault: {
      color: theme.onGradient,
    },
    buttonTextCancel: {
      color: theme.textPrimary,
    },
    buttonTextDestructive: {
      color: theme.onGradient,
    },
  });
}
