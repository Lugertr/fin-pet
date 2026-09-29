// src/components/adventure/AdventureActiveView/AdventureActiveView.styles.ts
// Экран смены (макет «Работа», 28.09.2026). Сцена (work.svg — питомец за
// работой, фон уже внутри картинки) ограничена по ширине (см.
// AdventureActiveView.tsx: sceneWidth/sceneHeight), чтобы на широких экранах
// не растягивалась на весь экран.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AdventureActiveViewStylesParams {
  theme: Theme;
}

export function createAdventureActiveViewStyles({ theme }: AdventureActiveViewStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.md,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
    },
    sceneOuter: {
      alignItems: 'center',
    },
    sceneBox: {
      borderRadius: radius.lg,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    sceneImage: {
      width: '100%',
      height: '100%',
    },
    // «Работа: 2 из 5» — плашка над треком этапов.
    progressPill: {
      alignSelf: 'center',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    progressPillText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    remainingTimeText: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      textAlign: 'center',
    },
    primaryButton: {
      minHeight: 56,
      backgroundColor: theme.primary,
      borderRadius: radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    // Демо: «Завершить урок» — под главной кнопкой, вторичная (контур).
    demoFinishButton: {
      minHeight: touchTarget.recommended,
      borderRadius: radius.xl,
      borderWidth: 2,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    demoFinishButtonText: {
      color: theme.primary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    // Модалка «План» — карточка по центру экрана фиксированной ширины (не
    // растягивается на широких экранах), высота — по содержимому.
    planModalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    // Фон окна — как у экрана итогов: карточки внутри (План и факт, бюджет)
    // отделяются от него сами.
    planModalContent: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
      backgroundColor: theme.background,
      borderRadius: radius.xxl,
      padding: spacing.md,
    },
    planModalBody: {
      gap: spacing.md,
    },
    planModalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    planModalTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
  });
}
