// constants/planCategories.ts
// Цвета категорий денег приключения. На планировании — «Потратить» и
// «Коплю»; траты событий делятся на нужное («Надо») и желаемое («Хочу»).
// Декоративная полоска шапки — надо / хочу / коплю. Смысл всегда дублируется
// подписью, цвет — только оформление (§23).

import { colorPalettes } from '@/theme/tokens';

export const PLAN_CATEGORY_COLORS = {
  spend: colorPalettes.orange[500],
  need: colorPalettes.orange[500],
  want: colorPalettes.violet[500],
  save: colorPalettes.emerald[500],
} as const;

const PLAN_CATEGORY_PALETTES = {
  spend: colorPalettes.orange,
  need: colorPalettes.orange,
  want: colorPalettes.violet,
  save: colorPalettes.emerald,
} as const;

/**
 * Цвет суммы категории, написанной текстом («40 C» в «Копилке»): оттенок 500
 * на белом слишком бледный для текста, поэтому на светлой теме — 600, на
 * тёмной — 400.
 */
export function planCategoryTextColor(
  category: keyof typeof PLAN_CATEGORY_PALETTES,
  isDark: boolean
): string {
  return PLAN_CATEGORY_PALETTES[category][isDark ? 400 : 600];
}
