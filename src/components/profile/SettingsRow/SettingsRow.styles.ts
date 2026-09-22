// src/components/profile/SettingsRow/SettingsRow.styles.ts

import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createSettingsRowStyles() {
  return StyleSheet.create({
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    settingsIconBox: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsLabel: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
    },
  });
}
