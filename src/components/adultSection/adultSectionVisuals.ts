// src/components/adultSection/adultSectionVisuals.ts
// Общий фирменный градиент шапки раздела для взрослого — фиксированная,
// не зависящая от темы «взрослая» идентичность (тёмный слейт), тот же приём,
// что уже применяется для градиентов веток в lessons/branchVisuals.ts.

import { colorPalettes } from '@/theme/tokens';

export const ADULT_SECTION_HEADER_GRADIENT: [string, string] = [
  colorPalettes.slate[700],
  colorPalettes.slate[900],
];
