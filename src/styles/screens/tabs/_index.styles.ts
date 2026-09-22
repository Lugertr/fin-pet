// src/app/(tabs)/index.styles.ts
// Стили самого экрана хаба. Стили секций (шапка/период/быстрые действия/
// ежедневная награда/совет дня) переехали в src/components/hub/*/*.styles.ts
// вместе с компонентами при разбиении этого экрана.

import type { Theme } from '@/theme';
import { StyleSheet } from 'react-native';

interface HubStylesParams {
  theme: Theme;
}

export function createHubStyles({ theme }: HubStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
  });
}
