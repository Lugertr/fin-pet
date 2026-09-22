// src/components/hub/HubHeader/HubHeader.styles.ts
//
// Акцентный цвет кнопки "Пройти урок" — theme.accent (см. Theme в
// src/theme/themes.ts), тот же акцент, что и в онбординге/шагах урока/квизе.
//
// header/roomWrapper — flex:1, а не фиксированная высота: комната должна
// реально занимать весь экран между шапкой-названием и кнопками снизу, а не
// подстраиваться под какой-то расчётный процент от высоты (см. PetRoom.styles.ts).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface HubHeaderStylesParams {
  theme: Theme;
}

export function createHubHeaderStyles({ theme }: HubHeaderStylesParams) {
  return StyleSheet.create({
    header: {
      flex: 1,
      paddingHorizontal: spacing.xxl,
    },
    roomWrapper: {
      flex: 1,
    },

    // CTA: перейти к урокам + быстрый доступ к аркаде — единственное, что
    // осталось под комнатой (см. HubHeader.tsx)
    ctaRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    ctaMainButton: {
      flex: 1,
      backgroundColor: theme.accent,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    ctaMainButtonText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    ctaIconButton: {
      width: 48,
      backgroundColor: withAlpha(theme.warning, 0.15),
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
