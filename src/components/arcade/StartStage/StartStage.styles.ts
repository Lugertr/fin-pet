// src/components/arcade/StartStage/StartStage.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface StartStageStylesParams {
  theme: Theme;
}

export function createStartStageStyles({ theme }: StartStageStylesParams) {
  return StyleSheet.create({
    // Контент в ScrollView (flexGrow сохраняет justifyContent:'center' при
    // коротком содержимом), кнопка «Начать игру» в ScreenFooter снаружи
    // (см. StartStage.tsx) — иначе на маленьком экране кнопку не достать.
    startContainer: {
      flex: 1,
    },
    startScrollArea: {
      flex: 1,
    },
    startScrollContent: {
      flexGrow: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
    },
    startHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    startIconBox: {
      width: 120,
      height: 120,
      borderRadius: 32,
      backgroundColor: withAlpha(theme.primary, 0.15),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
      borderWidth: 2,
      borderColor: withAlpha(theme.primary, 0.3),
    },
    startTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    startBadge: {
      backgroundColor: withAlpha(theme.success, 0.15),
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: withAlpha(theme.success, 0.3),
      marginBottom: spacing.lg,
    },
    startBadgeText: {
      color: theme.success,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    startDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
      lineHeight: 20,
    },
    statsCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.borderLight,
    },
    statLabel: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
      marginBottom: spacing.xs,
    },
    statValue: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
    },
    statValueCoins: {
      color: theme.coins,
    },
    statValueSuccess: {
      color: theme.success,
    },
    gradientButton: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    gradientButtonInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    gradientButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
