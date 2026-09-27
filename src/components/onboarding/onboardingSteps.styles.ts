// src/components/onboarding/onboardingSteps.styles.ts
// Общие стили для шагов онбординга — заголовки шагов, поля ввода, карточки
// выбора и общий футер (точки-пагинация + кнопки навигации) используются
// несколькими компонентами одновременно, поэтому один общий файл, а не по
// .styles.ts на компонент.
//
// Акцентный цвет здесь — theme.accent (индиго по умолчанию), отдельный от
// theme.primary (изумрудный) — тот же акцент используется для CTA/выделений
// в хабе, шагах урока и квизе (см. HubHeader/lessonSteps/QuizGame).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import {
  circleRadius,
  colorPalettes,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface OnboardingStepsStylesParams {
  theme: Theme;
}

export function createOnboardingStepsStyles({ theme }: OnboardingStepsStylesParams) {
  return StyleSheet.create({
    // Заголовки шагов (везде — слева, шаг 6/реворд — по центру, см. rewardTitle)
    // Заголовок/подзаголовок шага, когда сам шаг шире колонки (лента питомцев).
    stepTextColumn: {
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
    },
    stepTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      textAlign: 'left',
      marginBottom: spacing.xs,
    },
    centeredText: {
      textAlign: 'center',
    },
    stepSubtitle: {
      color: theme.textSecondary,
      textAlign: 'left',
      marginBottom: spacing.xl,
      fontSize: fontSizes.md,
    },

    // Общий нижний футер (все 6 шагов): точки-пагинация + кнопки навигации.
    // Контейнер футера (паддинги, safe-area) — styles.footer в
    // onboarding.styles.ts; здесь только внутренняя раскладка точек/кнопок.
    bottomDotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginBottom: spacing.md,
    },
    stepDot: {
      width: 6,
      height: 6,
      borderRadius: circleRadius(6),
      backgroundColor: theme.border,
    },
    stepDotActive: {
      backgroundColor: theme.accent,
    },
    stepDotCompleted: {
      backgroundColor: theme.success,
    },
    bottomStepCaption: {
      color: theme.textMuted,
      fontSize: fontSizes.xxs,
      marginLeft: spacing.xs,
    },

    // Поля ввода (имя питомца на шаге 4)
    inputLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      marginBottom: spacing.sm,
    },
    inputField: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputContainer: {
      marginBottom: spacing.xxl,
    },

    // Кнопки навигации (общий футер)
    navButtonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    navButtonBack: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.full,
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    navButtonBackText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    navButtonNext: {
      flex: 1,
      borderRadius: radius.full,
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    navButtonNextEnabled: {
      backgroundColor: theme.accent,
    },
    navButtonNextDisabled: {
      backgroundColor: theme.surfaceLight,
      opacity: 0.5,
    },
    navButtonNextText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Шаг 1: интро («Знакомься: это Финни») — декоративная композиция:
    // тёмная карточка с «?» в центре + иконки-бейджи по краям.
    introIllustrationBox: {
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    introCenterCard: {
      backgroundColor: colorPalettes.slate[800],
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    introCenterDotsRow: {
      position: 'absolute',
      bottom: spacing.md,
      flexDirection: 'row',
      gap: 4,
    },
    introCenterDot: {
      backgroundColor: withAlpha(theme.onGradient, 0.5),
    },
    introBadgeCircle: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: circleRadius(48),
      alignItems: 'center',
      justifyContent: 'center',
    },
    introBadgeTopLeft: {
      top: -8,
      left: -8,
    },
    introBadgeTopRight: {
      top: -8,
      right: -8,
    },
    introBadgeBottomLeft: {
      bottom: -8,
      left: -8,
    },
    introBadgeBottomRight: {
      bottom: -18,
      right: -18,
      opacity: 0.85,
    },

    // Шаг 1: неприметный переключатель «Режим демонстрации» (§18) под текстом.
    introDemoToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: spacing.sm,
      minHeight: 48,
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: theme.border,
    },
    introDemoToggleOn: {
      borderColor: theme.accent,
      backgroundColor: withAlpha(theme.accent, 0.1),
    },
    introDemoToggleText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    introDemoToggleTextOn: {
      color: theme.accent,
    },
    introDemoHint: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      marginTop: spacing.sm,
    },

    // Шаг 2: «Три типа решений» — 3 статичные карточки категорий трат
    decisionsCardsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    decisionCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      alignItems: 'center',
      padding: spacing.md,
      gap: spacing.xxs,
    },
    decisionIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxs,
    },
    decisionLabel: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
      textAlign: 'center',
    },
    decisionSubLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.xxs,
      textAlign: 'center',
    },

    // Шаг 3: карусель питомцев
    // flexGrow + center: если все карточки помещаются (широкий экран), лента
    // стоит по центру; если нет — листается как обычно.
    carouselTrackContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    carouselCard: {
      borderRadius: radius.xl,
      borderWidth: 2,
      backgroundColor: theme.surface,
    },
    carouselCardSelected: {
      borderColor: theme.accent,
    },
    carouselCardUnselected: {
      borderColor: theme.borderLight,
    },
    petCardInner: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    // Высота фиксирована (равна чекмарку, см. petCardCheckmark) и не зависит
    // от того, показан ли чекмарк — иначе при выборе карточки эта строка
    // меняла бы высоту (0 -> высота чекмарка), и всё под ней (аватар/имя/
    // тэглайн) заметно «прыгало» бы вниз/вверх.
    petCardTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      width: '100%',
      height: 22,
      marginBottom: spacing.xs,
    },
    petCardCheckmark: {
      width: 22,
      height: 22,
      borderRadius: circleRadius(22),
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    petAvatarCircle: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    petName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    petTagline: {
      color: theme.textSecondary,
      fontSize: fontSizes.xs,
      textAlign: 'center',
    },

    // Шаг 4: настройка спутника — цвет корпуса + имя
    customizePreviewBox: {
      alignItems: 'center',
    },
    swatchRow: {
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    swatchOuter: {
      width: 44,
      height: 44,
      borderRadius: circleRadius(44),
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchOuterSelected: {
      borderColor: theme.textPrimary,
    },
    swatchInner: {
      width: 32,
      height: 32,
      borderRadius: circleRadius(32),
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Шаг 5: выбор направления (одиночный выбор)
    branchesContainer: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    branchCard: {
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    branchCardSelected: {
      backgroundColor: withAlpha(theme.accent, 0.08),
      borderColor: theme.accent,
    },
    branchCardUnselected: {
      backgroundColor: theme.surface,
      borderColor: theme.borderLight,
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
    branchNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    branchName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    branchDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.xs,
      marginTop: spacing.xxs,
    },
    branchBonusBadge: {
      backgroundColor: withAlpha(theme.success, 0.15),
      borderRadius: radius.full,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
    },
    branchBonusBadgeText: {
      color: theme.success,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxs,
    },
    branchRadio: {
      width: 24,
      height: 24,
      borderRadius: circleRadius(24),
      alignItems: 'center',
      justifyContent: 'center',
    },
    branchRadioSelected: {
      backgroundColor: theme.accent,
    },
    branchRadioUnselected: {
      borderWidth: 2,
      borderColor: theme.border,
    },
    footerHint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      marginBottom: spacing.xl,
    },
    footerHintText: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      flex: 1,
      lineHeight: 16,
    },

    // Шаг 6: стартовый капитал
    rewardContainer: {
      alignItems: 'center',
    },
    rewardIllustrationBox: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    rewardTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    rewardCard: {
      width: '100%',
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    rewardCardLabel: {
      color: withAlpha(theme.onGradient, 0.85),
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    rewardCardValueRow: {
      marginBottom: spacing.md,
    },
    rewardCardValue: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.hero,
    },
    rewardCardBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: withAlpha(colorPalettes.slate[950], 0.2),
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs,
    },
    rewardCardBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: circleRadius(6),
      backgroundColor: theme.success,
    },
    rewardCardBadgeText: {
      color: theme.onGradient,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xs,
    },
    confirmationPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: withAlpha(theme.success, 0.12),
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginBottom: spacing.xxl,
    },
    confirmationPillText: {
      color: theme.success,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    rewardFooterHint: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });
}
