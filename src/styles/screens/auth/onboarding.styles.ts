// src/app/(auth)/onboarding.styles.ts
// Стили экрана онбординга

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface OnboardingStylesParams {
  theme: Theme;
}

export function createOnboardingStyles({ theme }: OnboardingStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: spacing.xxxl,
      gap: spacing.sm,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressDotActive: {
      width: 32,
      backgroundColor: theme.primary,
    },
    progressDotCompleted: {
      backgroundColor: theme.primaryLight,
    },

    // Шаг 1: Приветствие
    welcomeContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    welcomeEmoji: {
      fontSize: 72,
      marginBottom: spacing.lg,
    },
    welcomeTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.hero,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    welcomeAccent: {
      color: theme.primary,
    },
    welcomeSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: fontSizes.lg,
      lineHeight: 22,
    },

    // Поля ввода
    inputLabel: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      marginBottom: spacing.sm,
    },
    inputField: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputContainer: {
      marginBottom: spacing.xxl,
    },

    // Кнопки навигации
    navButtonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    navButtonBack: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    navButtonBackText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    navButtonNext: {
      flex: 1,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    navButtonNextEnabled: {
      backgroundColor: theme.primary,
    },
    navButtonNextDisabled: {
      backgroundColor: theme.surfaceLight,
      opacity: 0.5,
    },
    navButtonNextText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Шаг 2: Выбор питомца
    stepTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    stepSubtitle: {
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxl,
      fontSize: fontSizes.md,
    },
    petsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xxl,
    },
    petCard: {
      flex: 1,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: 'transparent',
    },
    petCardSelected: {
      borderColor: '#FFFFFF',
    },
    petCardInner: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    petEmoji: {
      fontSize: 48,
      marginBottom: spacing.sm,
    },
    petName: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      marginBottom: spacing.xs,
    },
    petDescription: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.xs,
      textAlign: 'center',
    },

    // Шаг 3: Выбор тем
    branchesContainer: {
      gap: spacing.sm,
      marginBottom: spacing.xxl,
    },
    branchCard: {
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    branchCardSelected: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: theme.success,
    },
    branchCardUnselected: {
      backgroundColor: theme.surfaceLight,
      borderColor: theme.border,
    },
    branchInfo: {
      flex: 1,
    },
    branchName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.lg,
    },
    branchDescription: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginTop: spacing.xxs,
    },
    branchCheckmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.success,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Информационный баннер
    infoBanner: {
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xxl,
    },
    infoBannerText: {
      color: '#A5B4FC',
      fontSize: fontSizes.sm,
      flex: 1,
      lineHeight: 18,
    },

    // Кнопка старта
    startButtonEnabled: {
      backgroundColor: theme.success,
    },
    startButtonDisabled: {
      backgroundColor: theme.surfaceLight,
      opacity: 0.5,
    },
  });
}
