// src/components/adventure/AdventureActiveView/AdventureActiveView.styles.ts
// Сцена (SVG-фон-плейсхолдер + спрайт питомца) ограничена по ширине (см.
// AdventureActiveView.tsx: sceneWidth/sceneHeight/petSize), чтобы на широких
// экранах фон не растягивался на весь экран, превращая питомца в точку.
// Полоска прогресса с оставшимся временем — сразу под сценой, той же ширины.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
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
      paddingHorizontal: spacing.xxl,
      paddingBottom: spacing.xxxl,
    },
    blockSpacing: {
      marginBottom: spacing.md,
    },
    sceneOuter: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    sceneBox: {
      borderRadius: radius.lg,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    sceneBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    scenePetWrap: {
      position: 'absolute',
      bottom: '16%',
      left: '50%',
    },
    // Прогресс приключения под сценой — заполнение по adventureProgressRatio
    // (тот же расчёт, что у награды при досрочном завершении), рядом текстом
    // оставшееся время — смысл передаёт не только цвет полоски (§23).
    timeBlock: {
      marginTop: spacing.sm,
    },
    progressBarTrack: {
      height: 10,
      borderRadius: radius.sm,
      backgroundColor: theme.surfaceLight,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: radius.sm,
    },
    budgetRow: {
      alignSelf: 'center',
      marginTop: spacing.xxs,
    },
    budgetText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    remainingTimeText: {
      color: theme.textSecondary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    // Карточка «сейчас в приключении» — тема (ветка) + текущий урок/задание.
    lessonInfoTopic: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xxs,
    },
    lessonInfoTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    // Кнопка «План» — одна строка (иконка + заголовок/подпись + стрелка).
    // «Банка» в приключении нет — он только на хабе (копилка).
    quickActionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 48,
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      padding: spacing.md,
    },
    quickActionIconBox: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionTextColumn: {
      flex: 1,
    },
    quickActionTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    quickActionSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.xs,
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
      paddingHorizontal: spacing.xl,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    planModalContent: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      backgroundColor: theme.surface,
      borderRadius: radius.xxl,
      padding: spacing.xl,
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
    rowLabel: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      marginBottom: spacing.xxs,
    },
    // Сумма (CoinAmount) — отступ у строки, а не у текста, чтобы иконка
    // монеты оставалась на одной линии с числом.
    valueRow: {
      marginBottom: spacing.sm,
    },
    rowValue: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    // «Выполнить задание» + квадратная кнопка аркады справа.
    questRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    questButton: {
      flex: 1,
    },
    arcadeButton: {
      width: touchTarget.recommended + spacing.sm,
      backgroundColor: withAlpha(theme.warning, 0.15),
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // «Есть нерешённое событие — открыть» — над кнопкой задания.
    eventBanner: {
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    primaryButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    secondaryButtonText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
  });
}
