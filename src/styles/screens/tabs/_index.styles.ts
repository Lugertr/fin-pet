// src/app/(tabs)/index.styles.ts
// Стили главного экрана (Хаба)

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface HubStylesParams {
  theme: Theme;
}

export function createHubStyles({ theme }: HubStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Шапка
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    greetingText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxs,
    },
    balanceText: {
      color: theme.textPrimary,
      fontSize: fontSizes.hero,
      fontWeight: fontWeights.bold,
    },
    balanceLabel: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
      marginTop: spacing.xxs,
    },
    coinsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    coinsText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Предупреждения
    warningBanner: {
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    warningBannerError: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    warningBannerSuccess: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    warningTextError: {
      color: '#FCA5A5',
      fontSize: fontSizes.sm,
      flex: 1,
    },
    warningTextSuccess: {
      color: '#86EFAC',
      fontSize: fontSizes.sm,
      flex: 1,
    },
    timeUntilFullRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    timeUntilFullText: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
    },

    // Секция быстрых действий
    actionsSection: {
      padding: spacing.xxl,
      paddingTop: spacing.xl,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      marginBottom: spacing.lg,
    },
    mainActionButton: {
      borderRadius: radius.xl,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    mainActionInner: {
      padding: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    mainActionIconBox: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainActionTextContainer: {
      flex: 1,
    },
    mainActionTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    mainActionSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.sm,
      marginTop: spacing.xxs,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    actionCard: {
      flex: 1,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    actionCardInner: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    actionCardTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      marginTop: spacing.sm,
    },
    actionCardSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.xs,
      marginTop: spacing.xxs,
    },

    // Баннер подарков
    giftsBanner: {
      borderRadius: radius.xl,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    giftsBannerInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    giftsIconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    giftsEmoji: {
      fontSize: 24,
    },
    giftsTextContainer: {
      flex: 1,
    },
    giftsTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    giftsSubtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: fontSizes.sm,
    },

    // Ежедневная награда
    dailySection: {
      paddingHorizontal: spacing.xxl,
      paddingBottom: spacing.lg,
    },
    dailyCard: {
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    dailyCardInner: {
      padding: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dailyLeftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    dailyIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dailyEmoji: {
      fontSize: 24,
    },
    dailyTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    dailySubtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: fontSizes.sm,
    },
    dailyButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
    },
    dailyButtonText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },

    // Стрик-календарь
    streakRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
    },
    streakDayContainer: {
      alignItems: 'center',
    },
    streakDayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    streakDayNumber: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },

    // Совет дня
    tipSection: {
      paddingHorizontal: spacing.xxl,
      paddingBottom: spacing.xxxl,
    },
    tipCard: {
      borderRadius: radius.lg,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      borderWidth: 1,
    },
    tipIconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      marginBottom: spacing.xs,
    },
    tipText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      lineHeight: 18,
    },
  });
}
