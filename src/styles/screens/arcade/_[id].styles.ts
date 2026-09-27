// src/app/(modal)/arcade/[id].styles.ts
// Стили экранов аркады — шапка, загрузка и список мини-игр (arcade-lobby). Стили этапов (старт/игра/
// результаты) переехали в src/components/arcade/*/*.styles.ts вместе с
// компонентами при разбиении этого экрана.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, shadows, spacing, touchTarget } from '@/theme/tokens';
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

    // Выбор мини-игры ((modal)/arcade-lobby)
    lobbyContent: {
      padding: spacing.lg,
      paddingBottom: spacing.massive,
      gap: spacing.md,
    },
    lobbyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: withAlpha(theme.primary, 0.08),
    },
    lobbyInfoText: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: fontSizes.md,
    },
    lobbyGameCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: touchTarget.recommended,
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: theme.surface,
      ...shadows.sm,
    },
    lobbyGameIcon: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lobbyGameTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    lobbyGameText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginTop: 2,
    },
    lobbyEmpty: {
      alignItems: 'center',
      paddingVertical: spacing.huge,
      gap: spacing.sm,
    },
    lobbyEmptyTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    lobbyEmptyText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
  });
}
