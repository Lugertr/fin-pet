// src/app/(modal)/gifts-list.styles.ts
// Стили самого экрана списка подарков — шапка, статистика, табы, обёртка списка.
// Стили карточек переехали в src/components/gifts/PendingGiftCard/ и
// src/components/gifts/HistoryGiftCard/ вместе с компонентами.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
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
    headerTitle: {
      color: theme.onGradient,
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
      backgroundColor: withAlpha(theme.onGradient, 0.15),
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: withAlpha(theme.onGradient, 0.2),
    },
    statValue: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
    },
    statValueCoins: {
      fontSize: fontSizes.lg,
    },
    statLabel: {
      color: withAlpha(theme.onGradient, 0.8),
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
      color: theme.onGradient,
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
  });
}
