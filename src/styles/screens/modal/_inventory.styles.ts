// src/app/(modal)/inventory.styles.ts
// Стили самого экрана инвентаря — шапка, статистика, категории, список.
// Стили карточки предмета и модалки деталей переехали в
// src/components/inventory/*/*.styles.ts вместе с компонентами.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface InventoryStylesParams {
  theme: Theme;
}

export function createInventoryStyles({ theme }: InventoryStylesParams) {
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
      marginBottom: spacing.lg,
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
      fontSize: fontSizes.xl,
    },
    statValueCoins: {
      color: theme.coins,
    },
    statValueSuccess: {
      color: theme.success,
    },
    statLabel: {
      color: withAlpha(theme.onGradient, 0.8),
      fontSize: fontSizes.xs,
    },

    // Список предметов
    itemsScroll: {
      flex: 1,
    },
    itemsScrollContent: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.massive,
    },
    emptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
}
