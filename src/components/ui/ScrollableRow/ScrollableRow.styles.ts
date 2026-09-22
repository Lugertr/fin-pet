// src/components/ui/ScrollableRow/ScrollableRow.styles.ts

import type { Theme } from '@/theme';
import { shadows } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ScrollableRowStylesParams {
  theme: Theme;
}

export function createScrollableRowStyles({ theme }: ScrollableRowStylesParams) {
  return StyleSheet.create({
    container: {
      position: 'relative',
    },
    // Тап-зона — во всю высоту ленты (проще попасть, чем в маленький кружок),
    // сам кружок-стрелка — просто визуальный бейдж по центру этой зоны.
    arrow: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowLeft: {
      left: 0,
    },
    arrowRight: {
      right: 0,
    },
    arrowBadge: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
  });
}
