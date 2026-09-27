// src/components/adultSection/PinGate/PinGate.styles.ts
// Стили экрана PIN-гейта родительского раздела (setup/entry/recovery).

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
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
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    // Иконка-бейдж вместо аватара питомца — открытый/закрытый замок на
    // фирменном градиенте (см. референс дизайна экрана PIN-кода).
    iconBadge: {
      width: 96,
      height: 96,
      borderRadius: radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
      ...shadows.lg,
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
