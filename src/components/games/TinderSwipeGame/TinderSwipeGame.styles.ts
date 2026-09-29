// src/components/games/TinderSwipeGame/TinderSwipeGame.styles.ts
// Стили свайп-игры

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 360);
export const CARD_HEIGHT = 400;
export const SWIPE_THRESHOLD = 100;

interface TinderSwipeGameStylesParams {
  theme: Theme;
}

export function createTinderSwipeGameStyles({ theme }: TinderSwipeGameStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    feedbackContainer: {
      marginBottom: spacing.lg,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
    },
    feedbackText: {
      textAlign: 'center',
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    cardArea: {
      height: CARD_HEIGHT + 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxl,
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: radius.xxl,
      overflow: 'hidden',
      zIndex: 2,
      ...shadows.xl,
    },
    // Декоративные карточки-«тени» позади активной — только для ощущения
    // стопки (см. референс дизайна), без содержимого и без интерактивности.
    // Абсолютные и центрированные вручную (left:50%+отриц. margin) — card
    // выше в потоке не абсолютный, чтобы центрирование cardArea (flex) само
    // расположило рабочую карточку, а эти две подстраиваются под неё.
    stackCardBase: {
      position: 'absolute',
      top: 20,
      left: '50%',
      marginLeft: -CARD_WIDTH / 2,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: radius.xxl,
      overflow: 'hidden',
      backgroundColor: theme.surface,
      ...shadows.xl,
    },
    stackCardBack1: {
      transform: [{ translateY: 10 }, { scale: 0.96 }, { rotate: '-2deg' }],
      opacity: 0.7,
      zIndex: 1,
    },
    stackCardBack2: {
      transform: [{ translateY: 18 }, { scale: 0.92 }, { rotate: '3deg' }],
      opacity: 0.45,
      zIndex: 0,
    },
    cardInner: {
      flex: 1,
      padding: spacing.xxl,
      backgroundColor: theme.surface,
      justifyContent: 'center',
    },
    // Угловые плашки «← Нет» / «Да →» — только у вопроса «да / нет»
    // (LessonPlan.swipeSides); стороны постоянные.
    cornerPill: {
      position: 'absolute',
      top: spacing.lg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      backgroundColor: theme.surface,
    },
    cornerPillLeft: {
      left: spacing.lg,
      transform: [{ rotate: '-8deg' }],
    },
    cornerPillRight: {
      right: spacing.lg,
      transform: [{ rotate: '8deg' }],
    },
    cornerPillText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
    },
    situationIconContainer: {
      width: 72,
      height: 72,
      borderRadius: circleRadius(72),
      backgroundColor: withAlpha(theme.accent, 0.2),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: spacing.xl,
      borderWidth: 2,
      borderColor: withAlpha(theme.accent, 0.4),
    },
    situationLabel: {
      color: withAlpha(theme.onGradient, 0.6),
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginBottom: spacing.md,
      letterSpacing: 1,
    },
    questionText: {
      color: theme.onGradient,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      lineHeight: 28,
    },
    // Цвет рамки — из TinderSwipeGame (да/нет или нейтральный у выбора из
    // двух); ширина ограничена — у выбора на бейдже целый ответ.
    likeBadge: {
      position: 'absolute',
      top: spacing.xxl,
      right: spacing.xxl,
      maxWidth: '70%',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: theme.success,
      backgroundColor: theme.surface,
      transform: [{ rotate: '15deg' }],
    },
    nopeBadge: {
      position: 'absolute',
      top: spacing.xxl,
      left: spacing.xxl,
      maxWidth: '70%',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: theme.error,
      backgroundColor: theme.surface,
      transform: [{ rotate: '-15deg' }],
    },
    swipeFeedbackText: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xxxl,
      marginBottom: spacing.lg,
    },
    // Колонка кнопки: кружок ✗ / ✓ (или стрелка) и под ним — что значит этот ответ.
    buttonColumn: {
      alignItems: 'center',
      width: 120,
      gap: spacing.xs,
    },
    buttonCaption: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },
    swipeButtonOuter: {
      width: 64,
      height: 64,
      borderRadius: circleRadius(64),
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeButtonInner: {
      width: 56,
      height: 56,
      borderRadius: circleRadius(56),
      borderWidth: 3,
      backgroundColor: theme.onGradient,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    progressCaption: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
    },
    hintLink: {
      color: theme.accent,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      textDecorationLine: 'underline',
    },
    hintText: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: spacing.sm,
    },
  });
}
