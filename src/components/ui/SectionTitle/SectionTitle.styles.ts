// src/components/ui/SectionTitle/SectionTitle.styles.ts

import type { Theme } from '@/theme';
import { fontWeights } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface SectionTitleStylesParams {
  theme: Theme;
}

export function createSectionTitleStyles({ theme }: SectionTitleStylesParams) {
  return StyleSheet.create({
    text: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
    },
  });
}
