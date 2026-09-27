// src/components/shared/AlertHost/AlertHost.styles.ts

import type { Theme } from '@/theme';
import { circleRadius, fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
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
      alignItems: 'center',
    },
    // Цветная плашка-лейбл («Удаление»/«Сброс») — прижата к левому краю
    // карточки и слегка приподнята над её содержимым, а не по центру.
    badge: {
      alignSelf: 'flex-start',
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs,
      marginBottom: spacing.md,
    },
    badgeText: {
      color: theme.onGradient,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: circleRadius(64),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
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
    actionButton: {
      width: '100%',
      minHeight: touchTarget.recommended,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    actionButtonDefault: {
      backgroundColor: theme.primary,
    },
    actionButtonDestructive: {
      backgroundColor: theme.error,
    },
    actionButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    // Кнопка отмены — текстовая ссылка под основной кнопкой, а не ещё один
    // закрашенный прямоугольник (см. референс дизайна модалок).
    cancelLink: {
      minHeight: touchTarget.min,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xs,
    },
    cancelLinkText: {
      color: theme.textMuted,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
  });
}
