// src/styles/common.ts
// Общие переиспользуемые стили для всего приложения

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

/**
 * Генератор общих стилей на основе темы
 * Вызывается с текущей темой для получения актуальных стилей
 */
export function createCommonStyles(theme: Theme) {
  return StyleSheet.create({
    // ============================================
    // Flex-паттерны
    // ============================================
    flexRow: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    flexRowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    flexCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    flexColumn: {
      flexDirection: 'column',
    } as ViewStyle,

    fullWidth: {
      width: '100%',
    } as ViewStyle,

    fullHeight: {
      height: '100%',
    } as ViewStyle,

    // ============================================
    // Отступы
    // ============================================
    paddingXs: { padding: spacing.xs } as ViewStyle,
    paddingSm: { padding: spacing.sm } as ViewStyle,
    paddingMd: { padding: spacing.md } as ViewStyle,
    paddingLg: { padding: spacing.lg } as ViewStyle,
    paddingXl: { padding: spacing.xl } as ViewStyle,
    paddingXxl: { padding: spacing.xxl } as ViewStyle,

    paddingHorizontalLg: { paddingHorizontal: spacing.lg } as ViewStyle,
    paddingHorizontalXl: { paddingHorizontal: spacing.xl } as ViewStyle,
    paddingHorizontalXxl: { paddingHorizontal: spacing.xxl } as ViewStyle,

    marginSm: { margin: spacing.sm } as ViewStyle,
    marginMd: { margin: spacing.md } as ViewStyle,
    marginLg: { margin: spacing.lg } as ViewStyle,

    // ============================================
    // Карточки и поверхности
    // ============================================
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: theme.borderLight,
      padding: spacing.lg,
    } as ViewStyle,

    cardElevated: {
      backgroundColor: theme.surfaceElevated,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: theme.borderLight,
      padding: spacing.lg,
      ...shadows.md,
    } as ViewStyle,

    surface: {
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
    } as ViewStyle,

    // ============================================
    // Типографика
    // ============================================
    textTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.title,
      fontWeight: fontWeights.bold,
    } as TextStyle,

    textHeading: {
      color: theme.textPrimary,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
    } as TextStyle,

    textSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
    } as TextStyle,

    textBody: {
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      lineHeight: fontSizes.md * 1.5,
    } as TextStyle,

    textCaption: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
    } as TextStyle,

    textMuted: {
      color: theme.textMuted,
      fontSize: fontSizes.sm,
    } as TextStyle,

    // ============================================
    // Разделители
    // ============================================
    divider: {
      height: 1,
      backgroundColor: theme.divider,
    } as ViewStyle,

    dividerVertical: {
      width: 1,
      backgroundColor: theme.divider,
    } as ViewStyle,

    // ============================================
    // Кнопки-иконки (круглые)
    // ============================================
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    iconButtonPrimary: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
  });
}

export type CommonStyles = ReturnType<typeof createCommonStyles>;
