// src/components/lesson/lessonSteps.styles.ts
// Общие стили для всех шагов урока (StepRunner/*Step). Один файл, а не по
// .styles.ts на компонент: секции (теория, мини-игра, тест, завершение,
// кнопки) используются несколькими соседними компонентами одновременно
// (например gradientButton* — почти всеми) — дробление по компоненту
// привело бы к дублированию, а не к развязке.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface LessonStepsStylesParams {
  theme: Theme;
}

export function createLessonStepsStyles({ theme }: LessonStepsStylesParams) {
  return StyleSheet.create({
    // Общий внешний контейнер шага: ScrollView-зона + ScreenFooter с кнопкой
    // как соседний элемент после неё (см. RewardStep.tsx).
    stepContainer: {
      flex: 1,
    },

    // Теория
    comicScroll: {
      flex: 1,
    },
    comicScrollContent: {
      padding: spacing.xxl,
    },
    theoryAvatarBox: {
      alignItems: 'center',
    },
    theoryTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
    },
    comicCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    theoryTipPill: {
      alignSelf: 'flex-start',
      backgroundColor: withAlpha(theme.accent, 0.12),
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs,
    },
    theoryTipPillText: {
      color: theme.accent,
      fontWeight: fontWeights.bold,
    },
    theoryBonusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: withAlpha(theme.success, 0.1),
      borderRadius: radius.lg,
      marginBottom: spacing.lg,
    },
    theoryNextButton: {
      borderRadius: radius.lg,
      alignItems: 'center',
      backgroundColor: theme.accent,
    },
    theoryNextButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
    },

    // Мини-игра
    minigameContainer: {
      flex: 1,
      padding: spacing.xxl,
    },
    progressLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },

    // Тест
    testScroll: {
      flex: 1,
    },
    testScrollContent: {
      padding: spacing.xxl,
      justifyContent: 'center',
    },
    testResultContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    testResultIconBox: {
      width: 120,
      height: 120,
      borderRadius: circleRadius(120),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    testResultTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    testResultSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: fontSizes.md,
    },
    testStatsCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxl,
      marginBottom: spacing.xxxl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    testStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    testStatsLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.lg,
    },
    testStatsValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.hero,
    },
    testStatsProgressBar: {
      height: 12,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.sm,
      overflow: 'hidden',
    },

    // Завершение — контент в ScrollView (flexGrow вместо flex, чтобы
    // justifyContent:'center' продолжал работать при коротком содержимом),
    // кнопка в ScreenFooter снаружи (см. StageDoneStep.tsx).
    completeScrollArea: {
      flex: 1,
    },
    completeScrollContent: {
      flexGrow: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    completeTrophyBox: {
      width: 140,
      height: 140,
      borderRadius: circleRadius(140),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxl,
    },
    completeTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.hero,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    completeSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: fontSizes.lg,
      marginBottom: spacing.xxxl,
    },

    // Кнопки (общие для всех шагов)
    gradientButton: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    gradientButtonInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    gradientButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Шаг «Награда» — контент в ScrollView (flexGrow, см. комментарий у
    // completeScrollContent выше), кнопка «Забрать» в ScreenFooter снаружи.
    rewardScrollArea: {
      flex: 1,
    },
    rewardScrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    // Монеты награды (CoinAmount) — отступы у строки, чтобы иконка монеты
    // стояла на одной линии с числом.
    rewardCoinsRow: {
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    rewardCoinsText: {
      color: theme.coins,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.hero,
    },
    rewardTitle: {
      color: theme.accent,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.title,
      marginTop: spacing.lg,
      textAlign: 'center',
    },
    rewardReasonText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    rewardXpText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      marginTop: spacing.md,
    },
    // Звезда и бонус — урок впервые пройден без ошибок (вариант B).
    rewardPerfectCard: {
      alignSelf: 'stretch',
      backgroundColor: withAlpha(theme.success, 0.12),
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: withAlpha(theme.success, 0.3),
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    rewardPerfectTitle: {
      color: theme.success,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    // Звезды пока нет — как её получить (нейтрально, без упрёка).
    rewardHintCard: {
      alignSelf: 'stretch',
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      marginTop: spacing.lg,
    },
    rewardHintText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    rewardLevelUp: {
      alignSelf: 'stretch',
      marginTop: spacing.lg,
    },
  });
}
