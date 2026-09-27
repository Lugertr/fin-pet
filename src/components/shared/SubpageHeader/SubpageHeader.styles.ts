// src/components/shared/SubpageHeader/SubpageHeader.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createSubpageHeaderStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    container: {
      paddingBottom: spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    // §23: тап-зона ≥48×48dp.
    iconButton: {
      width: touchTarget.recommended,
      height: touchTarget.recommended,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.title,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: fontSizes.lg,
      marginTop: spacing.xxs,
    },
  });
}
