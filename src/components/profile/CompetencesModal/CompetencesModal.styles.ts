// src/components/profile/CompetencesModal/CompetencesModal.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface CompetencesModalStylesParams {
  theme: Theme;
}

export function createCompetencesModalStyles({ theme }: CompetencesModalStylesParams) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
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
