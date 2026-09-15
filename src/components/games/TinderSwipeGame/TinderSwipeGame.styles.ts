// src/components/games/TinderSwipeGame/TinderSwipeGame.styles.ts
// Стили свайп-игры

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
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
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    instructionText: {
      color: '#A5B4FC',
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
      borderRadius: 36,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: spacing.xl,
      borderWidth: 2,
      borderColor: 'rgba(99, 102, 241, 0.4)',
    },
    situationEmoji: {
      fontSize: 36,
    },
    situationLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginBottom: spacing.md,
      letterSpacing: 1,
    },
    questionText: {
      color: '#FFFFFF',
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      lineHeight: 28,
      marginBottom: spacing.xxl,
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginVertical: spacing.lg,
    },
    optionsContainer: {
      gap: spacing.md,
    },
    leftOptionBox: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rightOptionBox: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    optionEmoji: {
      fontSize: 16,
    },
    leftOptionText: {
      color: '#FCA5A5',
      fontSize: fontSizes.md,
      flex: 1,
    },
    rightOptionText: {
      color: '#86EFAC',
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
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swipeButtonInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 3,
      backgroundColor: '#FFFFFF',
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
