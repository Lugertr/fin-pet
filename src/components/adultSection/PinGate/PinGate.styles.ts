// src/components/adultSection/PinGate/PinGate.styles.ts
// Стили экрана PIN-гейта родительского раздела (setup/entry/recovery).

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PinGateStylesParams {
  theme: Theme;
}

export function createPinGateStyles({ theme }: PinGateStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    avatarWrap: {
      marginBottom: spacing.lg,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.lg,
    },
    badgeText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xs,
      letterSpacing: 0.5,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxl,
      textAlign: 'center',
    },
    errorText: {
      color: theme.error,
      fontSize: fontSizes.sm,
      marginTop: -spacing.lg,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    linksRow: {
      marginTop: spacing.xxl,
      alignItems: 'center',
      gap: spacing.md,
    },
    link: {
      color: theme.primary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    linkMuted: {
      color: theme.textMuted,
      fontSize: fontSizes.md,
    },
  });
}
