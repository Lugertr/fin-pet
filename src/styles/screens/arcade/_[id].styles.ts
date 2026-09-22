// src/app/(modal)/arcade/[id].styles.ts
// Стили самого экрана аркады — шапка и загрузка. Стили этапов (старт/игра/
// результаты) переехали в src/components/arcade/*/*.styles.ts вместе с
// компонентами при разбиении этого экрана.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ArcadeStylesParams {
  theme: Theme;
}

export function createArcadeStyles({ theme }: ArcadeStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Заголовок
    header: {
      paddingTop: 56,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.xxl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    headerSubtitle: {
      color: withAlpha(theme.onGradient, 0.8),
      fontSize: fontSizes.sm,
    },

    // Загрузка
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      color: theme.textSecondary,
      marginTop: spacing.lg,
    },
  });
}
