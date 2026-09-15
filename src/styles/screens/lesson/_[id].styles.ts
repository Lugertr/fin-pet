// src/app/(modal)/lesson/[id].styles.ts
// Стили экрана урока

import type { Theme } from '@/theme';
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

    // Заголовок
    header: {
      paddingTop: 56,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.xxl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      flex: 1,
      textAlign: 'center',
    },

    // Этап 1: Комикс
    comicScroll: {
      flex: 1,
    },
    comicScrollContent: {
      padding: spacing.xxl,
    },
    comicHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    comicIconBox: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    comicEmoji: {
      fontSize: 48,
    },
    comicTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    comicSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: fontSizes.md,
    },
    comicCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    comicCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    comicCardIconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    comicCardTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
    },
    comicCardText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      lineHeight: 24,
    },
    comicListContainer: {
      gap: spacing.sm,
    },
    comicListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    comicListBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.success,
    },
    comicListItemText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },

    // Этап 2: Мини-игра
    minigameContainer: {
      flex: 1,
      padding: spacing.xxl,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    progressLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    progressPercent: {
      color: theme.primary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
      marginBottom: spacing.xxl,
    },

    // Этап 3: Тест
    testScroll: {
      flex: 1,
    },
    testScrollContent: {
      padding: spacing.xxl,
      justifyContent: 'center',
    },
    testResultContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    testResultIconBox: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    testResultEmoji: {
      fontSize: 56,
    },
    testResultTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    testResultSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: fontSizes.md,
    },
    testStatsCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      marginBottom: spacing.xxxl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    testStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    testStatsLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.lg,
    },
    testStatsValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.hero,
    },
    testStatsProgressBar: {
      height: 12,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.sm,
      overflow: 'hidden',
    },

    // Этап 4: Завершение
    completeContainer: {
      flex: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    completeTrophyBox: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxl,
    },
    completeTrophyEmoji: {
      fontSize: 72,
    },
    completeTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.hero,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    completeSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: fontSizes.lg,
      marginBottom: spacing.xxxl,
    },

    // Кнопки
    gradientButton: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    gradientButtonInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    gradientButtonText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
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
