// styles/screens/modal/_adult-section.styles.ts
// Стили самого экрана раздела для взрослого — контейнер и обёртка скролла
// (шапка — общая SubpageHeader, как у остальных подэкранов «Прогресса»).
// Стили барьера входа — в src/components/adultSection/ParentalGate/ParentalGate.styles.ts
// (та же шапка, кнопка-назад теперь общая — <IconButton variant="onGradient">).
// Стили карточек содержимого — в src/components/adultSection/adultSectionCards.styles.ts.

import type { Theme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AdultSectionStylesParams {
  theme: Theme;
}

export function createAdultSectionStyles({ theme }: AdultSectionStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    // Содержимое
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
  });
}
