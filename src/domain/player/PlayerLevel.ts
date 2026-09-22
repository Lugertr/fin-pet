// domain/player/PlayerLevel.ts
// Система XP/уровней игрока — по решению пользователя, отдельная от стадий
// роста питомца (§8 ТЗ, считается по успешным периодам бюджета, не по XP).
// Названия уровней — свой словарь, чтобы два разных «level up» не путались.
//
// XP начисляется за прохождение уроков (useLessons.ts:markLessonCompleted).
// Награда за уровень — таблица LEVEL_REWARDS, редактируется прямо здесь,
// без изменений остального кода (именно то, что просил пользователь).

/** XP, необходимый для перехода с уровня `level` на `level + 1`. */
export function xpForLevel(level: number): number {
  return 250 * level;
}

/** Суммарный XP, необходимый, чтобы ДОСТИЧЬ уровня `level` (уровень 1 = 0 XP). */
export function totalXpForLevel(level: number): number {
  return (250 * (level - 1) * level) / 2;
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
}

/** Уровень и прогресс внутри него по суммарному накопленному XP. */
export function computeLevel(totalXp: number): LevelInfo {
  let level = 1;
  while (totalXp >= totalXpForLevel(level + 1)) {
    level += 1;
  }
  return {
    level,
    xpIntoLevel: totalXp - totalXpForLevel(level),
    xpForNext: xpForLevel(level),
  };
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Стажёр',
  2: 'Ученик Финансов',
  3: 'Практикант',
  4: 'Финансовый Скаут',
  5: 'Финансовый Агент',
  6: 'Финансовый Стратег',
  7: 'Финансовый Эксперт',
  8: 'Финансовый Мастер',
  9: 'Финансовый Гуру',
  10: 'Финансовый Чемпион',
};

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] ?? LEVEL_TITLES[10];
}

/** XP, начисляемый за прохождение одного урока. */
export const XP_PER_LESSON = 50;

/**
 * Награда за достижение уровня — редактируемая таблица: что именно выдавать
 * на каждом уровне (монеты и/или предмет магазина по id из content/items.json).
 * Уровень 1 — стартовый, без награды.
 */
export const LEVEL_REWARDS: Record<number, { coins?: number; itemId?: number }> = {
  2: { coins: 100 },
  3: { coins: 150 },
  4: { coins: 200 },
  5: { coins: 250, itemId: 14 },
  6: { coins: 300 },
  7: { coins: 350, itemId: 11 },
  8: { coins: 400 },
  9: { coins: 500 },
  10: { coins: 750, itemId: 22 },
};
