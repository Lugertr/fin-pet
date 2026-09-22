// styles/screens/modal/_adult-section.styles.ts
// Стили самого экрана раздела для взрослого — контейнер, шапка, обёртка скролла.
// Стили барьера входа — в src/components/adultSection/ParentalGate/ParentalGate.styles.ts
// (та же шапка, кнопка-назад теперь общая — <IconButton variant="onGradient">).
// Стили карточек содержимого — в src/components/adultSection/adultSectionCards.styles.ts.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, spacing } from '@/theme/tokens';
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
    header: {
      paddingTop: 56,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
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
