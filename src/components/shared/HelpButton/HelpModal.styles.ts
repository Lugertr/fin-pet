// src/components/shared/HelpButton/HelpModal.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createHelpModalStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.huge,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '100%',
      alignSelf: 'center',
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.xl,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    title: {
      flex: 1,
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    list: {
      flexGrow: 0,
    },
    listContent: {
      gap: spacing.md,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    emoji: {
      width: 28,
      textAlign: 'center',
      fontSize: fontSizes.xl,
    },
    itemText: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      lineHeight: 22,
    },
    okButton: {
      minHeight: touchTarget.recommended,
      marginTop: spacing.xl,
      borderRadius: radius.lg,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    okText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
