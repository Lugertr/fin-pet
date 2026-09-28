// src/components/adventure/AdventureSummaryModal/AdventureSummaryModal.styles.ts
// Экран итогов смены (макет «Итоги работы»). Карточки «План и факт» и
// «Перенос в копилку» — в своих компонентах (AdventurePlanFactCard,
// AdventureAmountCard).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createAdventureSummaryModalStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    topRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
    },

    // ── Герой ──
    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.xxl,
      padding: spacing.lg,
      gap: spacing.sm,
      overflow: 'hidden',
    },
    // Декоративный светлый круг на фоне, как в макете.
    heroCircle: {
      position: 'absolute',
      top: -spacing.lg,
      left: '38%',
      borderRadius: radius.full,
      backgroundColor: withAlpha(theme.surface, 0.4),
    },
    heroText: {
      flex: 1,
      gap: spacing.xs,
    },
    heroChip: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.surface,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    heroChipText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    heroTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
    },
    heroSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },
    note: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },

    // ── Кнопки ──
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.sm,
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
    },
    primaryButton: {
      minHeight: 56,
      borderRadius: radius.xl,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    secondaryButton: {
      minHeight: touchTarget.recommended + 4,
      borderRadius: radius.xl,
      backgroundColor: withAlpha(theme.primary, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
