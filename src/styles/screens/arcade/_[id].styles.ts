// src/app/(modal)/arcade/[id].styles.ts
// Стили экрана аркады

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ArcadeStylesParams {
  theme: Theme;
}

export function createArcadeStyles({ theme }: ArcadeStylesParams) {
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
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.sm,
    },

    // Этап 1: Старт
    startContainer: {
      flex: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
    },
    startHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    startIconBox: {
      width: 120,
      height: 120,
      borderRadius: 32,
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
      borderWidth: 2,
      borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    startTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    startBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      marginBottom: spacing.lg,
    },
    startBadgeText: {
      color: theme.success,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    startDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      lineHeight: 20,
    },

    // Статистика игры
    statsCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.borderLight,
    },
    statLabel: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
      marginBottom: spacing.xs,
    },
    statValue: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
    },
    statValueCoins: {
      color: theme.coins,
    },
    statValueSuccess: {
      color: theme.success,
    },

    // Этап 2: Игра
    gameContainer: {
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
    progressCoinsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    progressCoins: {
      color: theme.coins,
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

    // Этап 3: Результаты
    resultsContainer: {
      flex: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
    },
    resultsHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    resultsIconBox: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    resultsEmoji: {
      fontSize: 72,
    },
    resultsTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    resultsSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    resultsStatsCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      marginBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    accuracyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    accuracyLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    accuracyValue: {
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
    },
    accuracyProgressBar: {
      height: 10,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
      marginBottom: spacing.xl,
    },
    coinsEarnedBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    coinsEarnedLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    coinsEarnedLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
    },
    coinsEarnedValue: {
      color: theme.coins,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
    },

    // Кнопки
    buttonsContainer: {
      gap: spacing.md,
    },
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
    secondaryButton: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.surfaceLight,
    },
    secondaryButtonText: {
      color: theme.textPrimary,
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
