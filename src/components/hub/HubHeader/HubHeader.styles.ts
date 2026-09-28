// src/components/hub/HubHeader/HubHeader.styles.ts
//
// Акцентный цвет кнопки «Начать приключение» — theme.accent (см. Theme в
// src/theme/themes.ts), тот же акцент, что и в онбординге/шагах урока/квизе.
//
// header/roomWrapper — flex:1, а не фиксированная высота: комната должна
// реально занимать весь экран между шапкой-названием и кнопками снизу, а не
// подстраиваться под какой-то расчётный процент от высоты (см. PetRoom.styles.ts).

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing, touchTarget } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface HubHeaderStylesParams {
  theme: Theme;
}

export function createHubHeaderStyles({ theme }: HubHeaderStylesParams) {
  return StyleSheet.create({
    // Отступы сверху/по бокам — из useAppHeaderPadding (общие для всех вкладок).
    header: {
      flex: 1,
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
    // Аркада — квадратная кнопка справа от главной (тап-зона ≥48dp).
    arcadeButton: {
      width: touchTarget.recommended + spacing.sm,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withAlpha(theme.warning, 0.15),
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
  });
}
