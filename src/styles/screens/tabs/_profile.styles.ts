// src/app/(tabs)/profile.styles.ts
// Стили самого экрана профиля — шапка, секции. Стили вынесенных подкомпонентов
// (SettingsModal/CompetencesModal/SettingsRow/StatTile/StreakCalendar/
// AchievementCard) переехали вместе с ними в src/components/profile/*/*.styles.ts.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ProfileStylesParams {
  theme: Theme;
}

export function createProfileStyles({ theme }: ProfileStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Шапка профиля — та же высота отступов, что и у остальных вкладок
    // (единая AppHeaderStats сверху, см. profile.tsx).
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: circleRadius(80),
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    userInfoContainer: {
      flex: 1,
    },
    username: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.xs,
    },
    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    streakText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
    },

    // Статистика
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },

    // Секции
    section: {
      padding: spacing.xxl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    sectionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: withAlpha(theme.primary, 0.15),
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    sectionButtonText: {
      color: theme.primary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },

    // Карточка с паутиной — фон/радиус/рамка от <Card>, здесь только центровка.
    spiderCardInner: {
      alignItems: 'center',
    },

    // Достижения (обёртка; карточки — AchievementCard)
    achievementsRow: {
      gap: spacing.md,
    },

    // Второй блок настроек — фон/радиус/рамка от <Card padding="none">.
    settingsCardSecondary: {
      marginTop: spacing.md,
    },
  });
}
