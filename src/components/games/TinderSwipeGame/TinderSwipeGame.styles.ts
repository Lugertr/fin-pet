// src/components/games/TinderSwipeGame/TinderSwipeGame.styles.ts
// Стили свайп-игры

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import {
  circleRadius,
  colorPalettes,
  emojiSizes,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
} from '@/theme/tokens';
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
    instructionBanner: {
      backgroundColor: withAlpha(theme.accent, 0.15),
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: withAlpha(theme.accent, 0.3),
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    instructionText: {
      color: theme.accentLight,
      fontSize: fontSizes.sm,
      flex: 1,
      lineHeight: 18,
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
      ...shadows.xl,
    },
    cardInner: {
      flex: 1,
      padding: spacing.xxl,
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
    situationEmoji: {
      fontSize: emojiSizes.md,
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
      marginBottom: spacing.xxl,
    },
    divider: {
      height: 1,
      backgroundColor: withAlpha(theme.onGradient, 0.1),
      marginVertical: spacing.lg,
    },
    optionsContainer: {
      gap: spacing.md,
    },
    leftOptionBox: {
      backgroundColor: withAlpha(theme.error, 0.15),
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: withAlpha(theme.error, 0.3),
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rightOptionBox: {
      backgroundColor: withAlpha(theme.success, 0.15),
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: withAlpha(theme.success, 0.3),
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    optionEmoji: {
      fontSize: 16,
    },
    leftOptionText: {
      color: colorPalettes.red[300],
      fontSize: fontSizes.md,
      flex: 1,
    },
    rightOptionText: {
      color: colorPalettes.emerald[300],
      fontSize: fontSizes.md,
      flex: 1,
    },
    likeBadge: {
      position: 'absolute',
      top: spacing.xxl,
      right: spacing.xxl,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: theme.success,
      transform: [{ rotate: '15deg' }],
    },
    nopeBadge: {
      position: 'absolute',
      top: spacing.xxl,
      left: spacing.xxl,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: theme.error,
      transform: [{ rotate: '-15deg' }],
    },
    likeText: {
      color: theme.success,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
    },
    nopeText: {
      color: theme.error,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xxxl,
      marginBottom: spacing.lg,
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
    hintText: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
}
