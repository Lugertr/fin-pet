// src/styles/screens/modal/_progress-subpage.styles.ts
// Общая раскладка подэкранов раздела «Прогресс» (макеты S32 и «Словарь»):
// достижения, словарь, настройки, документы, история операций.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createProgressSubpageStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.massive,
      gap: spacing.md,
    },

    // ── Сетка 2 колонки (достижения) ──
    gridRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    gridSpacer: {
      flex: 1,
    },

    // ── Поиск (словарь) ──
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      marginBottom: spacing.xs,
    },
    searchInput: {
      flex: 1,
      minHeight: touchTarget.recommended,
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
    },

    // ── Карточка-строка (слово словаря, документ, операция) ──
    itemCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      ...shadows.sm,
    },
    itemTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    itemText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginTop: spacing.xxs,
    },

    // ── Пустое состояние ──
    emptyBox: {
      alignItems: 'center',
      paddingVertical: spacing.huge,
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    emptyTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },

    // ── Настройки ──
    sectionTitle: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      marginTop: spacing.sm,
      marginLeft: spacing.xs,
    },
    settingText: {
      flex: 1,
    },
    settingLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
    },
    settingDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginTop: 2,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 52,
    },

    // ── История операций ──
    operationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    operationAmount: {
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
