// src/components/profile/achievementVisuals.ts
// Цвет плитки достижения (макеты S31/S32) — по порядку в content/achievements.json.
// Только оформление: название и подпись «открыто…» несут смысл текстом (§23).

import { colorPalettes } from '@/theme/tokens';

const ACHIEVEMENT_ACCENTS = [
  colorPalettes.emerald[500],
  colorPalettes.amber[500],
  colorPalettes.violet[500],
  colorPalettes.indigo[500],
  colorPalettes.orange[500],
  colorPalettes.cyan[500],
];

export function getAchievementAccent(index: number): string {
  return ACHIEVEMENT_ACCENTS[index % ACHIEVEMENT_ACCENTS.length];
}
