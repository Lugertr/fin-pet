// src/components/lessons/BranchTabRow/BranchTabRow.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

/** Минимальная ширина сегмента — достаточно для иконки + двух строк подписи
 * ветки; сам сегмент теперь flex:1 (см. ниже), это только нижняя граница. */
export const SEGMENT_WIDTH = 76;

interface BranchTabRowStylesParams {
  theme: Theme;
}

export function createBranchTabRowStyles({ theme }: BranchTabRowStylesParams) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    // minWidth:'100%' — лента растягивается минимум на всю ширину вьюпорта
    // скролла: на широком экране, где 7 сегментов физически умещаются без
    // скролла, flex:1 у сегмента (ниже) поровну добирает освободившееся
    // место вместо того, чтобы фон-«таблетка» повисал короткой полосой слева
    // с пустотой справа. Когда сегментам не хватает места (узкий экран),
    // minWidth сегмента не даёт им сжаться дальше разумного — тогда лента
    // просто становится шире вьюпорта и скроллится (см. ScrollableRow).
    bar: {
      flexDirection: 'row',
      minWidth: '100%',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.xs,
      gap: spacing.xxs,
    },
    segment: {
      flex: 1,
      minWidth: SEGMENT_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    segmentActive: {
      backgroundColor: theme.primary,
    },
    segmentInactive: {
      backgroundColor: 'transparent',
    },
    labelActive: {
      color: theme.onGradient,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xxs,
      textAlign: 'center',
    },
    labelInactive: {
      color: theme.textSecondary,
      fontWeight: fontWeights.medium,
      fontSize: fontSizes.xxs,
      textAlign: 'center',
    },
    // «X/Y» пройденных уроков темы — прогресс любой темы виден без переключения.
    progressActive: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxs,
    },
    progressInactive: {
      color: theme.textMuted,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.xxs,
    },
    priorityBadge: {
      position: 'absolute',
      top: -3,
      right: -3,
      width: 18,
      height: 18,
      borderRadius: radius.full,
      backgroundColor: theme.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
