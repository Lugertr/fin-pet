// src/app/(modal)/inventory.styles.ts
// Стили самого экрана инвентаря — шапка, статистика, категории, список.
// Стили карточки предмета и модалки деталей переехали в
// src/components/inventory/*/*.styles.ts вместе с компонентами.

import type { Theme } from '@/theme';
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

    // Статистика и категории под общей шапкой (SubpageHeader) — на фоне темы.
    header: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },

    // Статистика
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statTile: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    statValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    statLabel: {
      color: theme.textSecondary,
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
