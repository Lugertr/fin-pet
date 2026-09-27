// src/components/profile/profileCards.styles.ts
// Общие стили карточек раздела «Прогресс» и его подэкранов (макеты S31/S32,
// словарь): белая карточка с большим скруглением и мягкой тенью, строки
// меню/статистики, ссылки-действия. Один файл на все карточки — так же, как
// adultSection/adultSectionCards.styles.ts.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createProfileCardStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      ...shadows.sm,
    },
    cardTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // ── Уровень ──
    levelHeaderRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    levelXpText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    progressTrack: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
      marginTop: spacing.md,
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.full,
      backgroundColor: theme.primary,
    },
    levelFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    levelStageText: {
      color: theme.success,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    captionText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },

    // ── Превью достижений ──
    achievementsRow: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    achievementPreviewItem: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
    },
    achievementPreviewName: {
      textAlign: 'center',
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginTop: spacing.md,
    },

    // ── Ссылка-действие внизу карточки («все достижения», «история операций») ──
    linkButton: {
      minHeight: touchTarget.recommended,
      justifyContent: 'center',
      alignSelf: 'flex-start',
      marginTop: spacing.xs,
    },
    linkText: {
      color: theme.primary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
    },

    // ── Строки статистики и меню ──
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
      gap: spacing.md,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider,
    },
    rowLabel: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
    },
    rowValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      gap: spacing.lg,
      paddingHorizontal: spacing.sm,
    },
    menuLabel: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
    },
  });
}
