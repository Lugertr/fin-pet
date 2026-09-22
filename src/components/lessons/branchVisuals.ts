// src/components/lessons/branchVisuals.ts
// Иконки и градиенты веток — общие для дерева уроков и Аркады

import { colorPalettes } from '@/theme/tokens';
import type { IconName } from '@/types/icons';

export const BRANCH_ICONS: Record<number, IconName> = {
  1: 'wallet',
  2: 'shield-checkmark',
  3: 'trending-up',
  4: 'document-text',
  5: 'card',
  6: 'business',
  7: 'earth',
};

export const BRANCH_GRADIENTS: Record<number, [string, string]> = {
  1: [colorPalettes.emerald[500], colorPalettes.cyan[500]],
  2: [colorPalettes.cyan[500], colorPalettes.emerald[500]],
  3: [colorPalettes.amber[500], colorPalettes.orange[500]],
  4: [colorPalettes.red[500], colorPalettes.orange[500]],
  5: [colorPalettes.cyan[400], colorPalettes.indigo[500]],
  6: [colorPalettes.violet[500], colorPalettes.red[500]],
  7: [colorPalettes.emerald[500], colorPalettes.cyan[500]],
};
