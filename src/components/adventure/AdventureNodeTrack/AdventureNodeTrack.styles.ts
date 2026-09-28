// src/components/adventure/AdventureNodeTrack/AdventureNodeTrack.styles.ts

import type { Theme } from '@/theme';
import { colorPalettes, radius, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export function createAdventureNodeTrackStyles({ theme }: { theme: Theme }) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    // Ячейка — кружок и линия к следующему этапу; последняя без линии.
    cell: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    // Тап-зона ≥48dp вокруг кружка (§23).
    touch: {
      minWidth: touchTarget.recommended,
      minHeight: touchTarget.recommended,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceLight,
    },
    circleDone: {
      backgroundColor: colorPalettes.emerald[500],
    },
    circleCurrent: {
      backgroundColor: theme.primary,
      borderWidth: 4,
      borderColor: theme.surface,
    },
    connector: {
      width: 18,
      height: 3,
      borderRadius: radius.full,
      backgroundColor: theme.surfaceLight,
    },
    connectorDone: {
      backgroundColor: colorPalettes.emerald[500],
    },
    connectorCurrent: {
      backgroundColor: theme.primary,
    },
  });
}
