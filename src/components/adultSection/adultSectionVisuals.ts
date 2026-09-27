// src/components/adultSection/adultSectionVisuals.ts
// Общий фирменный градиент раздела для взрослого — используется только в
// ParentalGate (редкий recovery-путь «забыли PIN»; PinGate и главный экран
// раздела перешли на плоскую шапку без цветного баннера, см. референс
// дизайна). Раньше был тёмно-слейтовый, теперь — фирменный индиго.

import { colorPalettes } from '@/theme/tokens';

export const ADULT_SECTION_HEADER_GRADIENT: [string, string] = [
  colorPalettes.indigo[600],
  colorPalettes.indigo[800],
];
