// domain/adventure/Adventure.test.ts
// CLAUDE.md: «план бюджета: сумма распределения ≤ доступный бюджет, остаток»
// и «план vs факт за период» — здесь тестируется как чистая доменная логика.

import {
  AdventureRecord,
  actualSpend,
  canAfford,
  computeAdventurePayout,
  planOutcome,
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
    lessonId: 1,
    projectedIncome: 100,
    walletContribution: 0,
    budget: 100,
    plan: { mandatory: 40, optional: 30, savings: 30 },
    fact: { mandatory: 0, optional: 0, savings: 0 },
    startedAt: new Date(0).toISOString(),
    plannedEndAt: new Date(24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    xpAwarded: null,
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

describe('remainingMs / isTimeUp (смена — 24 часа)', () => {
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

describe('canAfford (§12.3 — без частичной оплаты)', () => {
  it('трата доступна, только если бюджета хватает целиком', () => {
    expect(canAfford(-20, 20)).toBe(true);
    expect(canAfford(-20, 19)).toBe(false);
  });

  it('бесплатный вариант и пополнение доступны всегда', () => {
    expect(canAfford(0, 0)).toBe(true);
    expect(canAfford(15, 0)).toBe(true);
  });
});

describe('planOutcome — итог плана трат для окна итогов', () => {
  const withSpend = (planned: number, spent: number) =>
    makeAdventure({
      plan: { mandatory: planned, optional: 0, savings: 20 },
      fact: { mandatory: spent, optional: 0, savings: 0 },
    });

  it('потрачено меньше плана — экономия и сколько сэкономлено', () => {
    expect(planOutcome(withSpend(30, 10))).toEqual({ kind: 'under', difference: 20 });
  });

  it('ровно по плану', () => {
    expect(planOutcome(withSpend(30, 30))).toEqual({ kind: 'exact', difference: 0 });
    expect(planOutcome(withSpend(0, 0))).toEqual({ kind: 'exact', difference: 0 });
  });

  it('больше плана — на сколько (положительное число)', () => {
    expect(planOutcome(withSpend(30, 45))).toEqual({ kind: 'over', difference: 15 });
  });
});

describe('computeAdventurePayout — монеты из кошелька (решение 28.09)', () => {
  it('без своих монет — как раньше: доля урока от всего', () => {
    expect(computeAdventurePayout(100, 30, 0.5)).toEqual(computeAdventurePayout(100, 30, 0.5, 0));
  });

  it('урок не пройден — свои монеты возвращаются целиком, по доле делится только доход', () => {
    // бюджет 150 = 100 дохода + 50 своих, ничего не потрачено, пройдена треть
    const payout = computeAdventurePayout(150, 0, 1 / 3, 50);
    expect(payout.toBank + payout.toWallet).toBe(50 + Math.floor(100 / 3));
  });

  it('свои монеты в «Коплю» уходят в банк целиком', () => {
    const payout = computeAdventurePayout(150, 50, 1 / 3, 50);
    expect(payout.toBank).toBe(50);
    expect(payout.toWallet).toBe(Math.floor(100 / 3));
  });

  it('потрачено больше дохода — возвращается только то, что осталось', () => {
    // 100 + 50 своих, потрачено 120 — осталось 30, всё своё
    expect(computeAdventurePayout(30, 0, 0.5, 50)).toEqual({ toBank: 0, toWallet: 30 });
  });

  it('урок пройден — всё как без своих монет', () => {
    expect(computeAdventurePayout(150, 40, 1, 50)).toEqual({ toBank: 40, toWallet: 110 });
  });
});
