// src/components/adultSection/adultSectionCards.styles.ts
// Общие стили карточек раздела для взрослого (AppGoalsCard/BranchProgressCard/
// StatsCard/DemoModeCard/DangerZoneActions).
//
// sectionTitle/card используются всеми пятью компонентами, neutralButton* —
// двумя (DemoModeCard, DangerZoneActions) — реального разделения по
// компонентам нет, дробить на 5 файлов смысла не имеет (тот же подход, что
// в lessonSteps.styles.ts).

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AdultSectionCardsStylesParams {
  theme: Theme;
}

export function createAdultSectionCardsStyles({ theme }: AdultSectionCardsStylesParams) {
  return StyleSheet.create({
    sectionTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      marginBottom: spacing.md,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },

    // AppGoalsCard
    goalRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    goalText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      flex: 1,
      lineHeight: 20,
    },

    // BranchProgressCard
    branchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    branchName: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
    },
    branchProgress: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },

    // StatsCard
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    statLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    statValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
    },

    // DemoModeCard
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      flex: 1,
    },
    switchHint: {
      color: theme.textSecondary,
      fontSize: fontSizes.xs,
      marginTop: spacing.xs,
    },

    // DemoModeCard (reset) + DangerZoneActions (reset profile)
    neutralButton: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    neutralButtonText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },

    // DangerZoneActions (delete profile)
    dangerButton: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: theme.error,
    },
    dangerButtonText: {
      color: theme.error,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    // DangerZoneActions — подпись под опасной зоной: раздел и так уже за
    // PIN-кодом (см. PinGate), эта строка просто объясняет ребёнку, почему
    // тут вообще можно менять такие вещи — см. референс дизайна.
    lockCaption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    lockCaptionText: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      flex: 1,
    },
  });
}
