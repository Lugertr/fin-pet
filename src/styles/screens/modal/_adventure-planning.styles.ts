// styles/screens/modal/_adventure-planning.styles.ts
// Стили планирования «Приключения»: шаг распределения дохода — как у
// бывшего budget-planning.styles.ts, + шаг выбора ветки (карточки как в
// онбординге, но локально, без зависимости от components/onboarding).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AdventurePlanningStylesParams {
  theme: Theme;
}

export function createAdventurePlanningStyles({ theme }: AdventurePlanningStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    // Шапка-статы — та же AppHeaderStats с кнопкой «назад» вместо лого и те
    // же отступы (useAppHeaderPadding), что и на вкладках: видно баланс/
    // накопления/энергию прямо во время распределения дохода.
    adventureInfoBar: {
      marginHorizontal: spacing.xxl,
      marginBottom: spacing.xl,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    headerTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      color: withAlpha(theme.onGradient, 0.85),
      fontSize: fontSizes.sm,
    },
    scrollContent: {
      padding: spacing.xxl,
      paddingBottom: spacing.xxxl,
    },
    availableCardSpacing: {
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    availableLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginBottom: spacing.xxs,
    },
    availableValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.hero,
    },
    remainderRow: {
      marginTop: spacing.xs,
    },
    remainderValue: {
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    categoryCardSpacing: {
      marginBottom: spacing.md,
    },
    categoryHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    categoryTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    categoryDescription: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      marginBottom: spacing.md,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    stepperButton: {
      // §23: тап-зона ≥48×48dp — было 40×40.
      width: touchTarget.recommended,
      height: touchTarget.recommended,
      borderRadius: radius.md,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Поле ввода с заливкой-прогрессом: подложка (surfaceLight) → полоска
    // доли бюджета (stepperFill, absolute) → прозрачный TextInput поверх.
    stepperField: {
      flex: 1,
      minHeight: touchTarget.recommended,
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    stepperFill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
    },
    stepperInput: {
      minHeight: touchTarget.recommended,
      textAlign: 'center',
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      backgroundColor: 'transparent',
      paddingVertical: spacing.sm,
    },
    stepperPercent: {
      position: 'absolute',
      right: spacing.sm,
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    primaryButtonDisabled: {
      opacity: 0.5,
    },
    primaryButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    backLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.lg,
    },
    backLinkText: {
      color: theme.primary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    branchCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 2,
      padding: spacing.md,
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    branchCardSelected: {
      borderColor: theme.primary,
      backgroundColor: withAlpha(theme.primary, 0.08),
    },
    branchCardUnselected: {
      borderColor: theme.surfaceLight,
      backgroundColor: theme.surface,
    },
    branchIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    branchInfo: {
      flex: 1,
    },
    branchName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    branchDoneBadge: {
      alignSelf: 'flex-start',
      backgroundColor: withAlpha(theme.success, 0.15),
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      marginTop: spacing.xxs,
    },
    branchDoneBadgeText: {
      color: theme.success,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xxs,
    },
  });
}
