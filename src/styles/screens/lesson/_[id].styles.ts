// src/app/(modal)/lesson/[id].styles.ts
// Стили самого экрана урока — контейнер, модалка паузы, загрузка. Шапка
// шага (закрыть/прогресс/настроение) — в
// src/components/lesson/LessonStepHeader/LessonStepHeader.styles.ts. Стили
// самих шагов урока (теория/мини-игра/тест/награда/планирование/завершение)
// — в src/components/lesson/lessonSteps.styles.ts.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonStylesParams {
  theme: Theme;
}

export function createLessonStyles({ theme }: LessonStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Модалка паузы урока — тот же фон, что и у остальных модалок в приложении.
    pauseOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    pauseCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
    },
    pauseBadge: {
      backgroundColor: withAlpha(theme.warning, 0.15),
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs,
      borderRadius: radius.full,
      marginBottom: spacing.md,
    },
    pauseBadgeText: {
      color: theme.warning,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xs,
    },
    pauseTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    pauseSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: fontSizes.sm,
      marginBottom: spacing.lg,
      lineHeight: 18,
    },
    pauseWarningBanner: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.md,
      backgroundColor: withAlpha(theme.error, 0.1),
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xl,
      width: '100%',
    },
    pauseWarningText: {
      color: theme.error,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
    },
    pauseContinueButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      width: '100%',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    pauseContinueText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    pauseExitButton: {
      paddingVertical: spacing.md,
      width: '100%',
      alignItems: 'center',
    },
    pauseExitText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },

    // Загрузка
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      color: theme.textSecondary,
      marginTop: spacing.lg,
    },
  });
}
