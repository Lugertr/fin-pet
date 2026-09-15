// src/app/(tabs)/profile.styles.ts
// Стили экрана профиля

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
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

    // Шапка профиля
    header: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.3)',
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    avatarEmoji: {
      fontSize: 40,
    },
    userInfoContainer: {
      flex: 1,
    },
    username: {
      color: '#FFFFFF',
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
      color: 'rgba(255,255,255,0.9)',
      fontSize: fontSizes.md,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Статистика
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statTile: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: radius.lg,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    statValue: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
      marginTop: spacing.xs,
      marginBottom: spacing.xxs,
    },
    statLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: fontSizes.xxs,
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
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
    },
    sectionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    sectionButtonText: {
      color: theme.primary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },

    // Карточка с паутиной
    spiderCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },

    // Стрик-календарь
    streakCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    streakDaysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    streakDayContainer: {
      alignItems: 'center',
      flex: 1,
    },
    streakDayCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    streakDayNumber: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
    streakDayName: {
      color: theme.textMuted,
      fontSize: fontSizes.xxs,
    },
    streakProgressBar: {
      height: 6,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    streakInfoBanner: {
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    streakInfoText: {
      fontSize: fontSizes.sm,
      flex: 1,
    },

    // Достижения
    achievementsScroll: {
      flexGrow: 0,
    },
    achievementsRow: {
      gap: spacing.md,
    },
    achievementCard: {
      width: 110,
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
    },
    achievementEmoji: {
      fontSize: 32,
      marginBottom: spacing.sm,
    },
    achievementTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },

    // Настройки
    settingsCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    settingsCardSecondary: {
      marginTop: spacing.md,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    settingsIconBox: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsLabel: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
    },

    // Модалка настроек
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: radius.xxxl,
      borderTopRightRadius: radius.xxxl,
      padding: spacing.xxl,
      paddingTop: spacing.xxxl,
    },
    modalTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    modalSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxl,
      textAlign: 'center',
    },
    toggleRowsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xxl,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    toggleRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    toggleIconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      marginBottom: spacing.xxs,
    },
    toggleDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    modalButton: {
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Модалка компетенций
    competenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },
    competenceName: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
    },
    competenceRightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    competenceProgressBar: {
      width: 100,
      height: 8,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
    },
    competencePercent: {
      color: theme.primary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
      width: 36,
      textAlign: 'right',
    },
  });
}
