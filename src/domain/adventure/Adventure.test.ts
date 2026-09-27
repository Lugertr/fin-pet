// domain/adventure/Adventure.test.ts
// CLAUDE.md: «план бюджета: сумма распределения ≤ доступный бюджет, остаток»
// и «план vs факт за период» — здесь тестируется как чистая доменная логика.

import {
  AdventureRecord,
  actualSpend,
  adventureProgressRatio,
  applyTimeAdjustment,
  computeAdventurePayout,
  clampAllocationAmount,
  isPlanBonusEligible,
  isTimeUp,
  plannedSpend,
  remainingMs,
  totalAllocation,
} from './Adventure';

function makeAdventure(overrides: Partial<AdventureRecord> = {}): AdventureRecord {
  return {
    id: 1,
    profileId: 'profile-1',
    adventureNumber: 1,
    status: 'active',
    branchId: 1,
    projectedIncome: 100,
    budget: 100,
    plan: { mandatory: 40, optional: 30, savings: 30 },
    fact: { mandatory: 0, optional: 0, savings: 0 },
    startedAt: new Date(0).toISOString(),
    plannedEndAt: new Date(8 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    timeAdjustmentMs: 0,
    questsCompleted: 0,
    xpAwarded: null,
    pendingEventTemplateId: null,
    pendingEventRolledAt: null,
    nextEventCheckAt: null,
    ...overrides,
  };
}

describe('clampAllocationAmount (план бюджета: сумма ≤ доступно, остаток)', () => {
  const empty = { mandatory: 0, optional: 0, savings: 0 };

  it('пропускает значение, не превышающее доступное', () => {
    const result = clampAllocationAmount(empty, 'mandatory', 40, 100);
    expect(result).toEqual({ mandatory: 40, optional: 0, savings: 0 });
    expect(totalAllocation(result)).toBeLessThanOrEqual(100);
  });

  it('обрезает значение до остатка, а не до всего доступного бюджета', () => {
    const withOthers = { mandatory: 0, optional: 60, savings: 20 };
    // Доступно 100, уже занято 80 (optional+savings) -> остаток для mandatory — 20,
    // а не 100 (что увело бы сумму трёх категорий в общий минус).
    const result = clampAllocationAmount(withOthers, 'mandatory', 999, 100);
    expect(result.mandatory).toBe(20);
    expect(totalAllocation(result)).toBe(100);
  });

  it('не уходит в отрицательные значения при отрицательном вводе', () => {
    const result = clampAllocationAmount(empty, 'savings', -50, 100);
    expect(result.savings).toBe(0);
  });

  it('сумма распределения никогда не превышает доступный бюджет ни для одной категории', () => {
    let allocation = empty;
    allocation = clampAllocationAmount(allocation, 'mandatory', 50, 100);
    allocation = clampAllocationAmount(allocation, 'optional', 50, 100);
    allocation = clampAllocationAmount(allocation, 'savings', 50, 100);
    expect(totalAllocation(allocation)).toBeLessThanOrEqual(100);
  });
});

describe('isPlanBonusEligible (план vs факт)', () => {
  it('даёт бонус, когда факт обязательного+желаемого равен плану', () => {
    const adventure = makeAdventure({ fact: { mandatory: 40, optional: 30, savings: 0 } });
    expect(isPlanBonusEligible(adventure)).toBe(true);
  });

  it('даёт бонус, когда факт меньше плана', () => {
    const adventure = makeAdventure({ fact: { mandatory: 10, optional: 5, savings: 0 } });
    expect(isPlanBonusEligible(adventure)).toBe(true);
  });

  it('не даёт бонус, когда факт превышает план', () => {
    const adventure = makeAdventure({ fact: { mandatory: 40, optional: 31, savings: 0 } });
    expect(isPlanBonusEligible(adventure)).toBe(false);
  });

  it('накопления не считаются расходом и не влияют на бонус', () => {
    // fact.savings намного больше plan.savings, но mandatory+optional в норме
    const adventure = makeAdventure({ fact: { mandatory: 40, optional: 30, savings: 1000 } });
    expect(isPlanBonusEligible(adventure)).toBe(true);
  });
});

describe('remainingMs / isTimeUp / applyTimeAdjustment', () => {
  it('remainingMs не уходит в отрицательное значение после дедлайна', () => {
    const adventure = makeAdventure({ plannedEndAt: new Date(1000).toISOString() });
    expect(remainingMs(adventure, 5000)).toBe(0);
  });

  it('isTimeUp ложно для планируемого/уже завершённого приключения', () => {
    const planning = makeAdventure({ status: 'planning', plannedEndAt: null });
    expect(isTimeUp(planning, Date.now())).toBe(false);
  });

  it('isTimeUp истинно, когда текущее время достигло plannedEndAt', () => {
    const adventure = makeAdventure({ plannedEndAt: new Date(1000).toISOString() });
    expect(isTimeUp(adventure, 1000)).toBe(true);
    expect(isTimeUp(adventure, 999)).toBe(false);
  });

  it('applyTimeAdjustment ускоряет (отрицательная дельта) в пределах пола', () => {
    const currentEnd = new Date(100_000).toISOString();
    const next = applyTimeAdjustment(currentEnd, -50_000, 0, 10_000);
    // 100000 - 50000 = 50000, что больше пола (0 + 10000) -> применяется полностью
    expect(new Date(next).getTime()).toBe(50_000);
  });

  it('applyTimeAdjustment не даёt таймеру уйти ниже минимального остатка', () => {
    const currentEnd = new Date(20_000).toISOString();
    // Огромное ускорение увело бы в прошлое — должно упереться в пол (now + min)
    const next = applyTimeAdjustment(currentEnd, -1_000_000, 0, 15_000);
    expect(new Date(next).getTime()).toBe(15_000);
  });

  it('applyTimeAdjustment не «оживляет» приключение, у которого время уже вышло', () => {
    const currentEnd = new Date(10_000).toISOString();
    // Задание после дедлайна: раньше конец сдвигался на now + пол = 65000.
    expect(applyTimeAdjustment(currentEnd, -50_000, 50_000, 15_000)).toBe(currentEnd);
    expect(applyTimeAdjustment(currentEnd, 60_000, 50_000, 15_000)).toBe(currentEnd);
  });

  it('applyTimeAdjustment: ускорение при остатке меньше пола не продлевает таймер', () => {
    // Осталось 10000 при поле 15000 — раньше конец уезжал на now + 15000.
    const currentEnd = new Date(10_000).toISOString();
    const next = applyTimeAdjustment(currentEnd, -45_000, 0, 15_000);
    expect(new Date(next).getTime()).toBe(10_000);
  });

  it('applyTimeAdjustment: задержка (положительная дельта) применяется целиком', () => {
    const currentEnd = new Date(100_000).toISOString();
    const next = applyTimeAdjustment(currentEnd, 20_000, 0, 15_000);
    expect(new Date(next).getTime()).toBe(120_000);
  });
});

describe('adventureProgressRatio (доля награды при досрочном завершении)', () => {
  it('равен 0 в момент старта', () => {
    const adventure = makeAdventure({
      startedAt: new Date(0).toISOString(),
      plannedEndAt: new Date(8 * 60 * 60 * 1000).toISOString(),
    });
    expect(adventureProgressRatio(adventure, 0)).toBe(0);
  });

  it('растёт линейно с прошедшим временем', () => {
    const adventure = makeAdventure({
      startedAt: new Date(0).toISOString(),
      plannedEndAt: new Date(8 * 60 * 60 * 1000).toISOString(),
    });
    expect(adventureProgressRatio(adventure, 4 * 60 * 60 * 1000)).toBeCloseTo(0.5);
  });

  it('равен ровно 1, когда время вышло (обычное завершение — полная награда)', () => {
    const adventure = makeAdventure({
      startedAt: new Date(0).toISOString(),
      plannedEndAt: new Date(8 * 60 * 60 * 1000).toISOString(),
    });
    expect(adventureProgressRatio(adventure, 8 * 60 * 60 * 1000)).toBe(1);
  });

  it('не превышает 1, даже если nowMs позже plannedEndAt', () => {
    const adventure = makeAdventure({
      startedAt: new Date(0).toISOString(),
      plannedEndAt: new Date(8 * 60 * 60 * 1000).toISOString(),
    });
    expect(adventureProgressRatio(adventure, 999 * 60 * 60 * 1000)).toBe(1);
  });

  it('равен 1, если приключение ещё не начато (нет startedAt/plannedEndAt)', () => {
    const adventure = makeAdventure({ startedAt: null, plannedEndAt: null });
    expect(adventureProgressRatio(adventure, Date.now())).toBe(1);
  });
});

describe('computeAdventurePayout (выплата бюджета приключения в хаб)', () => {
  it('«коплю» — в банк, остаток — в кошелёк', () => {
    expect(computeAdventurePayout(110, 30)).toEqual({ toBank: 30, toWallet: 80 });
  });

  it('если потрачено больше плана — в банк уходит сколько осталось', () => {
    expect(computeAdventurePayout(20, 30)).toEqual({ toBank: 20, toWallet: 0 });
  });

  it('пустой бюджет — ничего не выплачивается, без отрицательных сумм', () => {
    expect(computeAdventurePayout(0, 30)).toEqual({ toBank: 0, toWallet: 0 });
  });

  it('досрочно: выплачивается только пройденная доля (10% — 10%)', () => {
    expect(computeAdventurePayout(110, 30, 0.1)).toEqual({ toBank: 3, toWallet: 8 });
  });

  it('досрочно сразу после старта — почти ничего («начал и закрыл» не приносит бюджет)', () => {
    expect(computeAdventurePayout(100, 30, 0.001)).toEqual({ toBank: 0, toWallet: 0 });
  });
});

describe('plannedSpend / actualSpend (план «Потратить» — одна категория)', () => {
  it('новый план: «Потратить» в mandatory, optional = 0', () => {
    const adventure = makeAdventure({
      plan: { mandatory: 70, optional: 0, savings: 30 },
      fact: { mandatory: 25, optional: 40, savings: 0 },
    });
    expect(plannedSpend(adventure)).toBe(70);
    // Факт по-прежнему делится на нужное и желаемое, но сравнивается суммой.
    expect(actualSpend(adventure)).toBe(65);
    expect(isPlanBonusEligible(adventure)).toBe(true);
  });

  it('старый план надо+хочу считается той же суммой', () => {
    const adventure = makeAdventure({ plan: { mandatory: 40, optional: 30, savings: 30 } });
    expect(plannedSpend(adventure)).toBe(70);
  });
});
