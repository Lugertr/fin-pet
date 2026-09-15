// src/app/(modal)/gifts-list.styles.ts
// Стили экрана списка подарков

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface GiftsListStylesParams {
  theme: Theme;
}

export function createGiftsListStyles({ theme }: GiftsListStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Заголовок
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
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
      fontSize: fontSizes.xl,
    },

    // Статистика
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statTile: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    statValue: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
    },
    statValueCoins: {
      fontSize: fontSizes.lg,
    },
    statLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.xs,
    },

    // Переключатель табов
    tabSwitcher: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.xs,
      margin: spacing.lg,
      marginBottom: spacing.sm,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
    },
    tabButtonActive: {
      backgroundColor: theme.primary,
    },
    tabButtonText: {
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    tabButtonTextActive: {
      color: '#FFFFFF',
    },
    tabButtonTextInactive: {
      color: theme.textSecondary,
    },

    // Список
    listScroll: {
      flex: 1,
    },
    listScrollContent: {
      padding: spacing.lg,
    },
    pendingList: {
      gap: spacing.md,
    },
    historyList: {
      gap: spacing.sm,
    },

    // Пустое состояние
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
      lineHeight: 20,
    },

    // Карточка неоткрытого подарка
    pendingCard: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    pendingCardInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pendingIconBox: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    pendingEmoji: {
      fontSize: 32,
    },
    pendingInfoContainer: {
      flex: 1,
    },
    pendingTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxs,
    },
    pendingSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.sm,
    },
    pendingOpenButton: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    pendingOpenText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
    },

    // Карточка истории
    historyCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
    },
    historyIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    historyEmoji: {
      fontSize: 22,
    },
    historyInfoContainer: {
      flex: 1,
    },
    historyItemName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    historyRarityText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    historyDate: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
    },
  });
}
