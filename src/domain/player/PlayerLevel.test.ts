// domain/player/PlayerLevel.test.ts
// CLAUDE.md: «рост стадии по успешным периодам» — стадии заменены уровнем
// игрока (см. память проекта: level поглощает стадии), тестируем рост уровня
// по накопленному опыту: 300 на уровень, тема уроков — ровно уровень.

import {
  XP_PER_LEVEL,
  computeLevel,
  convertLegacyTotalXp,
  pickLookToGrant,
  totalXpForLevel,
  xpForLevel,
  xpToNextLevel,
} from './PlayerLevel';

describe('xpToNextLevel (демо: ровно до следующего уровня)', () => {
  it('с нуля — весь порог уровня 2', () => {
    expect(xpToNextLevel(0)).toBe(totalXpForLevel(2));
  });

  it('внутри уровня — остаток до следующего, и его ровно хватает на level-up', () => {
    const xp = totalXpForLevel(2) + 40;
    const need = xpToNextLevel(xp);
    expect(computeLevel(xp + need).level).toBe(3);
    expect(computeLevel(xp + need - 1).level).toBe(2);
  });
});

describe('xpForLevel / totalXpForLevel', () => {
  it('на каждый уровень — одинаково, 300 опыта (как у одной темы уроков)', () => {
    expect(XP_PER_LEVEL).toBe(300);
    for (const level of [1, 2, 5, 9]) expect(xpForLevel(level)).toBe(XP_PER_LEVEL);
  });

  it('+300 опыта с любой точки — ровно +1 уровень', () => {
    for (let xp = 0; xp <= totalXpForLevel(8); xp += 29) {
      expect(computeLevel(xp + XP_PER_LEVEL).level).toBe(computeLevel(xp).level + 1);
    }
  });

  it('суммарный порог уровня 1 равен нулю', () => {
    expect(totalXpForLevel(1)).toBe(0);
  });

  it('суммарный порог накапливается по предыдущим уровням', () => {
    expect(totalXpForLevel(3)).toBe(totalXpForLevel(2) + xpForLevel(2));
  });
});

describe('computeLevel (рост уровня по опыту)', () => {
  it('нулевой опыт — уровень 1', () => {
    expect(computeLevel(0).level).toBe(1);
  });

  it('опыт чуть меньше порога следующего уровня ещё не повышает уровень', () => {
    const threshold = totalXpForLevel(2);
    expect(computeLevel(threshold - 1).level).toBe(1);
  });

  it('опыт ровно на пороге повышает уровень', () => {
    const threshold = totalXpForLevel(2);
    expect(computeLevel(threshold).level).toBe(2);
  });

  it('уровень никогда не понижается — рост монотонный по мере накопления опыта', () => {
    let previousLevel = 1;
    for (let xp = 0; xp <= totalXpForLevel(6); xp += 37) {
      const level = computeLevel(xp).level;
      expect(level).toBeGreaterThanOrEqual(previousLevel);
      previousLevel = level;
    }
  });

  it('xpIntoLevel/xpForNext корректно описывают прогресс внутри уровня', () => {
    const threshold = totalXpForLevel(2);
    const info = computeLevel(threshold + 10);
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(10);
    expect(info.xpForNext).toBe(xpForLevel(2));
  });
});

describe('convertLegacyTotalXp (прежняя шкала 250 × уровень → 300 на уровень)', () => {
  /** Уровень по прежней шкале: порог уровня L — 125 × (L − 1) × L. */
  function legacyLevel(xp: number): number {
    let level = 1;
    while (125 * level * (level + 1) <= xp) level += 1;
    return level;
  }

  it('уровень при пересчёте не меняется — ни понижения, ни подарка уровня', () => {
    for (let xp = 0; xp <= 20_000; xp += 7) {
      expect(computeLevel(convertLegacyTotalXp(xp)).level).toBe(legacyLevel(xp));
    }
  });

  it('пороги прежней шкалы — ровно пороги новой, доля пути сохраняется', () => {
    expect(convertLegacyTotalXp(0)).toBe(0);
    expect(convertLegacyTotalXp(249)).toBe(298);
    expect(convertLegacyTotalXp(250)).toBe(300);
    expect(convertLegacyTotalXp(750)).toBe(600);
    // уровень 2 и половина пути до 3-го: было 250 из 500, стало 150 из 300
    expect(convertLegacyTotalXp(500)).toBe(450);
  });

  it('мусор — ноль', () => {
    expect(convertLegacyTotalXp(-5)).toBe(0);
    expect(convertLegacyTotalXp(Number.NaN)).toBe(0);
  });
});

describe('pickLookToGrant (облики: любой при создании, остальные — на уровнях 2 и 3)', () => {
  // Робот: 41 — классический (0), 13 — оранжевый (1), 14 — розовый (2).
  const looks = [
    { variant: 0, itemId: 41 },
    { variant: 1, itemId: 13 },
    { variant: 2, itemId: 14 },
  ];

  it('выбран классический: уровень 2 — первый цветной, уровень 3 — второй', () => {
    expect(pickLookToGrant(looks, [41], 0)).toBe(13);
    expect(pickLookToGrant(looks, [41, 13], 1)).toBe(14);
  });

  it('выбран первый цветной: уровень 2 — второй цветной, уровень 3 — классический', () => {
    expect(pickLookToGrant(looks, [13], 1)).toBe(14);
    expect(pickLookToGrant(looks, [13, 14], 2)).toBe(41);
  });

  it('выбран второй цветной: уровень 2 — первый цветной, уровень 3 — классический', () => {
    expect(pickLookToGrant(looks, [14], 2)).toBe(13);
    expect(pickLookToGrant(looks, [14, 13], 1)).toBe(41);
  });

  it('все облики уже есть — выдавать нечего', () => {
    expect(pickLookToGrant(looks, [41, 13, 14], 2)).toBeNull();
  });

  it('старый профиль: классический надет, но не в инвентаре — он уже доступен', () => {
    expect(pickLookToGrant(looks, [], 0)).toBe(13);
  });

  it('вид с одним обликом (мишка) — выдавать нечего', () => {
    expect(pickLookToGrant([{ variant: 0, itemId: 43 }], [43], 0)).toBeNull();
  });
});
