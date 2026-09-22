// src/components/profile/MedalsPreview/MedalsPreview.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface MedalsPreviewStylesParams {
  theme: Theme;
}

export function createMedalsPreviewStyles({ theme }: MedalsPreviewStylesParams) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xxl,
    },
    viewAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
    },
    viewAllText: {
      color: theme.primary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    cardsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
  });
}
