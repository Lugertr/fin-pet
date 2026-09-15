// src/app/(modal)/deposit.styles.ts
// Стили экрана вкладов

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface DepositStylesParams {
  theme: Theme;
}

export function createDepositStyles({ theme }: DepositStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Заголовок
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },

    // Карточка баланса
    balanceCard: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: radius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    balanceLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontSizes.sm,
      marginBottom: spacing.xs,
    },
    balanceValue: {
      color: '#FFFFFF',
      fontSize: fontSizes.hero,
      fontWeight: fontWeights.bold,
    },

    // Форма создания вклада
    createForm: {
      margin: spacing.lg,
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    formTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.lg,
    },
    inputLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.sm,
    },
    inputField: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      color: theme.textPrimary,
      fontSize: fontSizes.lg,
      marginBottom: spacing.lg,
    },
    quickAmountsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    quickAmountButton: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    quickAmountText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    rateInfoBanner: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: radius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    rateInfoText: {
      color: theme.success,
      fontSize: fontSizes.sm,
      textAlign: 'center',
      lineHeight: 18,
    },
    formButtonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    formButtonSecondary: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    formButtonPrimary: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    formButtonText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    formButtonTextSecondary: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },

    // Кнопка создания
    createButton: {
      margin: spacing.lg,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    createButtonInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },

    // Список вкладов
    depositsScroll: {
      flex: 1,
    },
    depositsScrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.lg,
    },
    emptyContainer: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xxxl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    emptyEmoji: {
      fontSize: 56,
      marginBottom: spacing.md,
    },
    emptyText: {
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    depositsList: {
      gap: spacing.md,
    },

    // Карточка вклада
    depositCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    depositHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    depositLeftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    depositIconBox: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    depositEmoji: {
      fontSize: 24,
    },
    depositPrincipal: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    depositMeta: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    },
    depositTotalContainer: {
      alignItems: 'flex-end',
    },
    depositTotal: {
      color: theme.success,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    depositInterest: {
      color: `${theme.success}B0`,
      fontSize: fontSizes.sm,
    },
    depositProgressBar: {
      height: 8,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xs,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    depositButtonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    depositButtonSecondary: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    depositButtonPrimary: {
      flex: 1,
      backgroundColor: theme.success,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    depositButtonText: {
      color: '#FFFFFF',
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    depositButtonTextSecondary: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
  });
}
