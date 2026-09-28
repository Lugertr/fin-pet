// domain/player/PlayerLevel.ts
// Система XP/уровней игрока — по решению пользователя, отдельная от стадий
// роста питомца (§8 ТЗ, считается по успешным периодам бюджета, не по XP).
// Названия уровней — свой словарь, чтобы два разных «level up» не путались.
//
// Опыт дают уроки (решение пользователя 28.09.2026): у каждой ветки 300 опыта,
// они делятся между её уроками (domain/lesson/lessonRewards.ts:lessonXp), и
// на каждый уровень нужно ровно 300 — закрытая ветка всегда даёт +1 уровень.
// Опыт начисляется через useLessonsStore.addXp(), чтобы level-up считался и
// награждался ровно в одном месте (useLessons.ts:grantLevelUpRewards).
// Награда за уровень — таблица LEVEL_REWARDS, редактируется прямо здесь,
// без изменений остального кода (именно то, что просил пользователь).

/** Опыт на один уровень — и весь опыт одной ветки уроков. */
export const XP_PER_LEVEL = 300;

/** XP, необходимый для перехода с уровня `level` на `level + 1` (одинаков для всех уровней). */
export function xpForLevel(_level: number): number {
  return XP_PER_LEVEL;
}

/** Суммарный XP, необходимый, чтобы ДОСТИЧЬ уровня `level` (уровень 1 = 0 XP). */
export function totalXpForLevel(level: number): number {
  return XP_PER_LEVEL * (level - 1);
}

/**
 * Опыт профиля, накопленный по прежней шкале (порог растёт: 250 × уровень),
 * — в опыт новой шкалы: уровень тот же, доля пути до следующего — та же
 * (округление вниз). Уровень при смене шкалы не понижается (§8.4). Та же
 * формула — в миграции v11 (data/local/migrations) для уже сохранённого опыта.
 */
export function convertLegacyTotalXp(legacyXp: number): number {
  if (!Number.isFinite(legacyXp) || legacyXp <= 0) return 0;
  const legacyTotalForLevel = (level: number) => 125 * (level - 1) * level;
  let level = 1;
  while (legacyTotalForLevel(level + 1) <= legacyXp) level += 1;
  const intoLevel = Math.floor(legacyXp) - legacyTotalForLevel(level);
  return totalXpForLevel(level) + Math.floor((intoLevel * XP_PER_LEVEL) / (250 * level));
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

/** Сколько XP не хватает до следующего уровня (всегда > 0). */
export function xpToNextLevel(totalXp: number): number {
  const { level } = computeLevel(totalXp);
  return totalXpForLevel(level + 1) - totalXp;
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

/**
 * Награда за достижение уровня — редактируемая таблица: что именно выдавать
 * на каждом уровне (монеты и/или предмет магазина по id из content/items.json).
 * Уровень 1 — стартовый, без награды.
 *
 * Починены 2 предсуществующих бага при переработке под скины по уровням
 * (useLessons.ts:grantLevelUpRewards): itemId 11 на уровне 7 указывал на
 * несуществующий товар (в content/items.json такого id нет вообще — addItem
 * молча ничего не делал), itemId 14 на уровне 5 — это скин РОБОТА жёстко
 * зашитый в таблицу без учёта вида питомца (медведю/коту он бы всё равно не
 * налез — equipSkin() отклоняет несовпадение pet_type). Оба заменены на
 * монеты; настоящий, видо-зависимый скин теперь выдаётся через
 * LEVEL_SKIN_VARIANT ниже.
 */
export const LEVEL_REWARDS: Record<number, { coins?: number; itemId?: number }> = {
  2: { coins: 100 },
  3: { coins: 150 },
  4: { coins: 200 },
  5: { coins: 250 },
  6: { coins: 300 },
  7: { coins: 350 },
  8: { coins: 400 },
  9: { coins: 500 },
  10: { coins: 750, itemId: 22 },
};

/**
 * Уровни, на которых питомец получает новый облик (решение пользователя
 * 27.09.2026): при создании ребёнок выбирает любой из трёх обликов своего
 * вида, а остальные два приходят на уровнях 2 и 3 — по одному (см.
 * pickLookToGrant). Обликов не купить и не получить иначе.
 */
export const LOOK_REWARD_LEVELS: number[] = [2, 3];

/** Облик вида питомца — как его отдаёт lib/pet/petSkin.ts getSkinsForPetType. */
export interface LookOption {
  variant: number;
  itemId: number | null;
}

/**
 * Какой облик выдать на уровне: первый ещё недоступный — сначала цветные
 * (variant 1, 2, …), классический (variant 0) последним. Доступен — получен
 * как предмет или надет сейчас (у старых профилей классический облик надет, но
 * не лежит в инвентаре). null — все облики уже есть (или у вида их нет).
 */
export function pickLookToGrant(
  looks: LookOption[],
  ownedItemIds: number[],
  equippedVariant: number
): number | null {
  const owned = new Set(ownedItemIds);
  const isAvailable = (look: LookOption) =>
    look.variant === equippedVariant || (look.itemId !== null && owned.has(look.itemId));
  const ordered = [
    ...looks.filter((look) => look.variant > 0).sort((a, b) => a.variant - b.variant),
    ...looks.filter((look) => look.variant === 0),
  ];
  return ordered.find((look) => look.itemId !== null && !isAvailable(look))?.itemId ?? null;
}
