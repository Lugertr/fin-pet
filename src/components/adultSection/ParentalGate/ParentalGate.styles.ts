// src/components/adultSection/ParentalGate/ParentalGate.styles.ts
// Стили барьера входа в раздел для взрослого (§17 ТЗ).
//
// container/header/headerTopRow/headerTitle дублируются из стилей экрана
// (src/styles/screens/modal/_adult-section.styles.ts), где та же шапка
// используется для стадии "content" — общих ключей всего четыре, отдельный
// файл под них не оправдан. Кнопка-назад — общая <IconButton variant="onGradient">.

import type { Theme } from '@/theme';
import { emojiSizes, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ParentalGateStylesParams {
  theme: Theme;
}

export function createParentalGateStyles({ theme }: ParentalGateStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },

    gateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
    },
    gateIcon: {
      fontSize: emojiSizes.lg,
      marginBottom: spacing.lg,
    },
    gateTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    gateSubtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxl,
      textAlign: 'center',
    },
    gateChallenge: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.hero,
      marginBottom: spacing.xl,
    },
    gateInput: {
      width: 140,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      color: theme.textPrimary,
      fontSize: fontSizes.xl,
      textAlign: 'center',
      marginBottom: spacing.lg,
      borderWidth: 2,
      borderColor: theme.borderLight,
    },
    gateInputError: {
      borderColor: theme.error,
    },
    gateButton: {
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xxxl,
      alignItems: 'center',
    },
    gateButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    gateErrorText: {
      color: theme.error,
      fontSize: fontSizes.sm,
      marginBottom: spacing.md,
    },
  });
}
