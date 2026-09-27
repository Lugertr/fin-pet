// src/components/adventure/AdventureSummaryModal/AdventureSummaryModal.styles.ts
// Экран итогов приключения (макет «Итоги работы»).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
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
    heroText: {
      flex: 1,
      gap: spacing.xs,
    },
    heroChip: {
      alignSelf: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    heroChipText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
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
      fontSize: fontSizes.sm,
      textAlign: 'center',
    },

    // ── Новый уровень ──
    levelUpCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: withAlpha(theme.primary, 0.1),
      borderWidth: 1,
      borderColor: withAlpha(theme.primary, 0.3),
    },
    levelUpTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    levelUpText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginTop: 2,
    },

    // ── План и факт ──
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    cardSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginTop: -spacing.sm,
    },
    tag: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    tagText: {
      color: theme.textSecondary,
      fontSize: fontSizes.xs,
    },
    planRow: {
      gap: spacing.xs,
    },
    planRowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: radius.full,
    },
    dotSmall: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    planLabel: {
      flex: 1,
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
    },
    planValues: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    planFact: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
    },
    track: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: radius.full,
    },
    splitRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.lg,
    },
    splitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    splitText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    statusText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },

    // ── Перенос в банк / кошелёк ──
    transferCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.xxl,
      backgroundColor: withAlpha(theme.primary, 0.06),
    },
    transferIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    transferTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    transferTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    amountChip: {
      backgroundColor: withAlpha(theme.coins, 0.25),
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    amountChipText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    transferText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginTop: 2,
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
