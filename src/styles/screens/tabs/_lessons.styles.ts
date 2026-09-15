// src/styles/screens/tabs/_lessons.styles.ts
// Стили экрана уроков

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonsStylesParams {
  theme: Theme;
}

export function createLessonsStyles({ theme }: LessonsStylesParams) {
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
    },
    title: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.lg,
    },

    // Переключатель табов
    tabSwitcher: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.xs,
    },

    // Контейнер для табов компетенций (фиксированная высота)
    branchesContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      marginBottom: spacing.md,
    },
    branchesScroll: {
      flexGrow: 1,
      alignItems: 'center',
    },
    branchesRow: {
      gap: spacing.xs,
      alignItems: 'center',
      height: '100%',
    },

    // Карточка ветки (выбранная)
    branchCardSelected: {
      borderRadius: radius.md,
      overflow: 'hidden',
      height: '100%',
    },
    branchCardSelectedInner: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      minWidth: 110,
      justifyContent: 'center',
      height: '100%',
    },
    branchCardSelectedTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xxs,
    },
    branchNameSelected: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
      flexShrink: 1,
    },

    // Карточка ветки (невыбранная)
    branchCardUnselected: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
      minWidth: 110,
      backgroundColor: theme.surfaceLight,
      justifyContent: 'center',
      height: '100%',
    },
    branchCardUnselectedTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xxs,
    },
    branchNameUnselected: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      flexShrink: 1,
    },

    // Бейдж приоритета
    priorityBadge: {
      borderRadius: radius.xs,
      paddingHorizontal: spacing.xxs,
      paddingVertical: 1,
    },
    priorityBadgeSelected: {
      backgroundColor: 'rgba(16, 185, 129, 0.4)',
    },
    priorityBadgeUnselected: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    priorityBadgeTextSelected: {
      color: '#FFFFFF',
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.bold,
    },
    priorityBadgeTextUnselected: {
      color: theme.success,
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.bold,
    },

    // Прогресс ветки
    branchProgressText: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.semibold,
    },
    branchProgressTextUnselected: {
      color: theme.textMuted,
      fontSize: fontSizes.xxs,
    },

    // Прогресс-бар ветки
    branchProgressSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    branchProgressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    branchProgressLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    branchProgressLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    recommendedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.sm,
    },
    recommendedText: {
      color: theme.success,
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.bold,
    },
    branchProgressPercent: {
      color: theme.primary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
    branchProgressBar: {
      height: 6,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
    },

    // Путь уроков
    lessonsScroll: {
      flex: 1,
    },
    lessonsScrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
      paddingTop: spacing.sm,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.massive,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
    },

    // Аркада
    arcadeEmptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxxl,
    },
    arcadeEmptyEmoji: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    arcadeEmptyTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    arcadeEmptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    arcadeScroll: {
      flex: 1,
    },
    arcadeScrollContent: {
      padding: spacing.lg,
    },
    arcadeInfoBanner: {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderRadius: radius.lg,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    arcadeInfoText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      flex: 1,
      lineHeight: 18,
    },
    arcadeList: {
      gap: spacing.md,
    },
  });
}
