// src/app/(modal)/inventory.styles.ts
// Стили экрана инвентаря

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
      marginBottom: spacing.lg,
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
      fontSize: fontSizes.xl,
    },
    statValueCoins: {
      color: '#FBBF24',
    },
    statValueSuccess: {
      color: '#34D399',
    },
    statLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.xs,
    },

    // Категории
    categoriesScroll: {
      flexGrow: 0,
    },
    categoriesRow: {
      gap: spacing.sm,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
    },
    categoryButtonActive: {
      backgroundColor: '#FFFFFF',
    },
    categoryButtonInactive: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    categoryText: {
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    categoryTextActive: {
      color: '#F59E0B',
    },
    categoryTextInactive: {
      color: '#FFFFFF',
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
    emptyEmoji: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    emptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
    },

    // Карточка предмета
    itemCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIconBox: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    itemEmoji: {
      fontSize: 28,
    },
    itemQuantityBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: theme.primary,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      minWidth: 20,
      alignItems: 'center',
    },
    itemQuantityText: {
      color: '#FFFFFF',
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.bold,
    },
    itemInfoContainer: {
      flex: 1,
    },
    itemNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    itemName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    placedBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
    },
    placedBadgeText: {
      color: theme.success,
      fontSize: fontSizes.xxs,
      fontWeight: fontWeights.bold,
    },
    itemDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },

    // Модалка деталей
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: radius.xxxl,
      borderTopRightRadius: radius.xxxl,
      padding: spacing.xxl,
      paddingTop: spacing.xxxl,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    modalItemIcon: {
      width: 80,
      height: 80,
      borderRadius: radius.xxl,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    modalItemEmoji: {
      fontSize: 48,
    },
    modalItemName: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.xs,
    },
    modalItemDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    modalStatsCard: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.xxl,
    },
    modalStatRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    modalStatLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    modalStatValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    modalStatValueSuccess: {
      color: theme.success,
    },
    modalButtonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    modalActionButton: {
      flex: 1,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    modalActionText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    modalCloseButton: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    modalCloseText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
  });
}
