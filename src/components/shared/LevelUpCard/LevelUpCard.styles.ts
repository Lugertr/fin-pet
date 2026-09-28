// src/components/shared/LevelUpCard/LevelUpCard.styles.ts

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createLevelUpCardStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: withAlpha(theme.primary, 0.1),
      borderWidth: 1,
      borderColor: withAlpha(theme.primary, 0.3),
    },
    body: {
      flex: 1,
    },
    title: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    text: {
      color: theme.textSecondary,
      fontSize: fontSizes.md,
      marginTop: 2,
    },
  });
}
