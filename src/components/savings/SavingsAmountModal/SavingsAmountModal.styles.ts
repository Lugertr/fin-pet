// src/components/savings/SavingsAmountModal/SavingsAmountModal.styles.ts
// Окно по центру экрана, не шире 400 — как модалка плана приключения.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createSavingsAmountModalStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    content: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.surfaceElevated,
      borderRadius: radius.xxl,
      padding: spacing.xl,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
      textAlign: 'center',
    },
    available: {
      color: theme.textSecondary,
      fontSize: fontSizes.lg,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    input: {
      minHeight: 56,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },
    presetsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    preset: {
      flex: 1,
      minHeight: touchTarget.recommended,
      borderRadius: radius.md,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
    },
    hint: {
      color: theme.error,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    note: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    cancelButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: radius.lg,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    confirmButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: radius.lg,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonDisabled: {
      opacity: 0.45,
    },
    confirmButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
