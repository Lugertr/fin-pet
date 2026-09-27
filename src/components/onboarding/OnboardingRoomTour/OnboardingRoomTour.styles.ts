// src/components/onboarding/OnboardingRoomTour/OnboardingRoomTour.styles.ts
// Тур по комнате (макеты «Онбординг-тур»): затемнённая сцена хаба, светлая
// подсвеченная часть и карточка пояснения поверх сцены снизу.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createOnboardingRoomTourStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    // Затемнение неподсвеченных частей сцены.
    dim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlay,
    },

    // ── Строка «Шаг N из 9» / «Пропустить» (поверх затемнения) ──
    chipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xs,
    },
    stepChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.surface,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      ...shadows.sm,
    },
    stepChipDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: theme.success,
    },
    stepChipText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    skipButton: {
      minHeight: touchTarget.recommended,
      minWidth: touchTarget.recommended,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    skipText: {
      color: theme.onGradient,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },

    // ── Шапка: подсвеченная — приподнятая белая карточка (шаг «деньги») ──
    headerCard: {
      marginHorizontal: spacing.sm,
      marginBottom: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.xl,
      backgroundColor: theme.surface,
      borderWidth: 3,
      borderColor: withAlpha(theme.onGradient, 0.9),
      ...shadows.lg,
    },
    headerPlain: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      backgroundColor: theme.background,
    },

    // ── Комната ──
    roomSpot: {
      flex: 1,
      overflow: 'hidden',
    },
    roomInner: {
      flex: 1,
    },
    roomBox: {
      position: 'absolute',
      top: 0,
    },
    calloutLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    calloutPill: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1.5,
      backgroundColor: theme.surface,
      ...shadows.sm,
    },
    calloutText: {
      flexShrink: 1,
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxs,
    },
    calloutLine: {
      position: 'absolute',
      width: 2,
    },
    calloutDot: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      backgroundColor: theme.surface,
    },

    // ── Нижние вкладки ──
    tabBar: {
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.surfaceLight,
      paddingTop: spacing.sm,
    },
    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xs,
      gap: spacing.xs,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },
    // Пронумерованная вкладка — светлая плашка, как на макете.
    tabItemMarked: {
      backgroundColor: withAlpha(theme.primary, 0.1),
      borderWidth: 1,
      borderColor: withAlpha(theme.primary, 0.25),
    },
    tabLabel: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xxs,
    },
    badge: {
      position: 'absolute',
      top: -8,
      right: -4,
      width: 22,
      height: 22,
      borderRadius: radius.full,
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xs,
    },

    // ── «Начать приключение» над карточкой ──
    floatingCta: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: 56,
      borderRadius: radius.xl,
      backgroundColor: theme.primary,
      ...shadows.lg,
    },
    ctaText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // ── Карточка пояснения ──
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      maxHeight: '64%',
      backgroundColor: theme.surface,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      ...shadows.lg,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: theme.border,
      marginBottom: spacing.md,
    },
    // Не растёт, но сжимается, если карточка упёрлась в maxHeight — тогда листается.
    sheetScroll: {
      flexGrow: 0,
      flexShrink: 1,
    },
    sheetTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    sheetTitle: {
      flexShrink: 1,
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
    },
    finalChip: {
      backgroundColor: withAlpha(theme.primary, 0.12),
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    finalChipText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxs,
    },
    list: {
      gap: spacing.sm,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      lineHeight: 20,
    },
    rowLead: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
    },
    numberRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    numberCircle: {
      width: 22,
      height: 22,
      borderRadius: radius.full,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    numberText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xs,
    },
    goalsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    goalCard: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    goalIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    goalBonus: {
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: 3,
    },
    goalBonusText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xxs,
      textAlign: 'center',
    },
    bullet: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    bulletDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    footnote: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    nextButton: {
      minHeight: 56,
      marginTop: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
