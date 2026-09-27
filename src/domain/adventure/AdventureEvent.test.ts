// domain/adventure/AdventureEvent.test.ts
// Ритм событий (isEventDue/EVENT_PACING): стартовая задержка, ускорение при
// заходе только в «здоровом» состоянии, стоп у конца и после него, лимит на
// приключение; выбор без повторов; §12.3 — без частичной оплаты.

import adventureEventsJson from '../../../content/adventure_events.json';
import { AdventureRecord } from './Adventure';
import {
  AdventureEventTemplate,
  EVENT_PACING,
  EventDueContext,
  isEventDue,
  isOptionAffordable,
  pickRandomEventTemplate,
  selectEventPool,
} from './AdventureEvent';

const MIN = 60 * 1000;

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
    nextEventCheckAt: new Date(0).toISOString(),
    ...overrides,
  };
}

/** «Здоровое» состояние игрока: энергия и деньги есть, обычная (не входная) проверка. */
function ctx(nowMs: number, overrides: Partial<EventDueContext> = {}): EventDueContext {
  return { nowMs, trigger: 'tick', balance: 100, mood: 80, eventsSoFar: 0, ...overrides };
}

describe('isEventDue — базовые условия', () => {
  it('не наступает в первую секунду приключения, даже если nextEventCheckAt уже в прошлом', () => {
    const adventure = makeAdventure({
      startedAt: new Date(0).toISOString(),
      nextEventCheckAt: new Date(0).toISOString(),
    });
    expect(isEventDue(adventure, ctx(1000))).toBe(false);
  });

  it('наступает после минимальной задержки с момента старта, когда nextEventCheckAt уже прошёл', () => {
    const adventure = makeAdventure({
      startedAt: new Date(0).toISOString(),
      nextEventCheckAt: new Date(0).toISOString(),
    });
    expect(isEventDue(adventure, ctx(6 * MIN))).toBe(true);
  });

  it('не наступает, пока приключение не активно', () => {
    const adventure = makeAdventure({ status: 'planning' });
    expect(isEventDue(adventure, ctx(6 * MIN))).toBe(false);
  });

  it('не наступает, пока есть неразрешённое событие', () => {
    const adventure = makeAdventure({ pendingEventTemplateId: 'snack' });
    expect(isEventDue(adventure, ctx(6 * MIN))).toBe(false);
  });

  it('не наступает раньше собственного nextEventCheckAt, даже после стартовой задержки', () => {
    const adventure = makeAdventure({
      startedAt: new Date(0).toISOString(),
      nextEventCheckAt: new Date(60 * MIN).toISOString(),
    });
    expect(isEventDue(adventure, ctx(6 * MIN))).toBe(false);
    expect(isEventDue(adventure, ctx(60 * MIN))).toBe(true);
  });
});

describe('isEventDue — ускорение при заходе на экран приключения', () => {
  // Обычный срок — через час после старта, входной — через полчаса.
  const adventure = makeAdventure({ nextEventCheckAt: new Date(60 * MIN).toISOString() });

  it('при заходе событие может появиться уже через 30 мин после предыдущего', () => {
    expect(isEventDue(adventure, ctx(30 * MIN, { trigger: 'entry' }))).toBe(true);
    expect(isEventDue(adventure, ctx(29 * MIN, { trigger: 'entry' }))).toBe(false);
  });

  it('обычная периодическая проверка (tick) не ускоряется — ждёт часовой срок', () => {
    expect(isEventDue(adventure, ctx(30 * MIN))).toBe(false);
    expect(isEventDue(adventure, ctx(60 * MIN))).toBe(true);
  });

  it('нет ускорения при низкой энергии питомца — но обычный срок остаётся', () => {
    expect(isEventDue(adventure, ctx(30 * MIN, { trigger: 'entry', mood: 20 }))).toBe(false);
    expect(isEventDue(adventure, ctx(60 * MIN, { trigger: 'entry', mood: 20 }))).toBe(true);
  });

  it('нет ускорения, когда в кошельке меньше 20% дохода приключения', () => {
    expect(isEventDue(adventure, ctx(30 * MIN, { trigger: 'entry', balance: 19 }))).toBe(false);
  });

  it('нет ускорения, когда бюджет трат плана уже исчерпан', () => {
    const planSpent = makeAdventure({
      nextEventCheckAt: new Date(60 * MIN).toISOString(),
      fact: { mandatory: 40, optional: 30, savings: 0 },
    });
    expect(isEventDue(planSpent, ctx(30 * MIN, { trigger: 'entry' }))).toBe(false);
  });

  it('нет ускорения в последний час приключения', () => {
    const nearEnd = makeAdventure({
      nextEventCheckAt: new Date(60 * MIN).toISOString(),
      plannedEndAt: new Date(90 * MIN).toISOString(),
    });
    // Осталось 45 мин — меньше часа.
    expect(isEventDue(nearEnd, ctx(45 * MIN, { trigger: 'entry' }))).toBe(false);
    // Обычный срок при этом работает (осталось 30 мин ≥ 20).
    expect(isEventDue(nearEnd, ctx(60 * MIN, { trigger: 'entry' }))).toBe(true);
  });
});

describe('isEventDue — конец приключения и лимит', () => {
  it('нет событий, когда до конца меньше 20 минут', () => {
    const adventure = makeAdventure({
      nextEventCheckAt: new Date(60 * MIN).toISOString(),
      plannedEndAt: new Date(70 * MIN).toISOString(),
    });
    expect(isEventDue(adventure, ctx(60 * MIN, { trigger: 'entry' }))).toBe(false);
  });

  it('нет событий после окончания времени приключения', () => {
    const adventure = makeAdventure({ nextEventCheckAt: new Date(0).toISOString() });
    expect(isEventDue(adventure, ctx(9 * 60 * MIN, { trigger: 'entry' }))).toBe(false);
    expect(isEventDue(adventure, ctx(9 * 60 * MIN))).toBe(false);
  });

  it('не больше 6 событий за приключение', () => {
    const adventure = makeAdventure({ nextEventCheckAt: new Date(0).toISOString() });
    expect(isEventDue(adventure, ctx(60 * MIN, { eventsSoFar: 5 }))).toBe(true);
    expect(isEventDue(adventure, ctx(60 * MIN, { eventsSoFar: 6 }))).toBe(false);
  });
});

function makeTemplate(id: string, pools: string[]): AdventureEventTemplate {
  return { id, title: id, description: '', icon: '🎲', options: [], pools };
}

describe('pickRandomEventTemplate (без повторов в приключении)', () => {
  const a = makeTemplate('a', ['normal']);
  const b = makeTemplate('b', ['normal']);
  const c = makeTemplate('c', ['low_money']);

  it('возвращает null для пустого списка', () => {
    expect(pickRandomEventTemplate([])).toBeNull();
  });

  it('не повторяет уже выпадавший шаблон, пока в пуле есть другие', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickRandomEventTemplate([a, b], ['a'])).toBe(b);
    }
  });

  it('если пул исчерпан — берёт ещё не выпадавший шаблон из всех', () => {
    expect(pickRandomEventTemplate([a], ['a'], [a, c])).toBe(c);
  });

  it('если выпадали вообще все — берёт из пула, а не пропускает событие', () => {
    expect(pickRandomEventTemplate([a], ['a'], [a])).toBe(a);
  });
});

describe('isOptionAffordable (§12.3 — без частичной оплаты)', () => {
  const paid = {
    id: 'p',
    label: '',
    category: 'mandatory' as const,
    coinAmount: -15,
    timeDeltaMinutes: 0,
  };
  const free = { id: 'f', label: '', category: null, coinAmount: 0, timeDeltaMinutes: 5 };
  const reward = { id: 'r', label: '', category: null, coinAmount: 20, timeDeltaMinutes: 0 };

  it('платный вариант доступен, только если денег хватает целиком', () => {
    expect(isOptionAffordable(paid, 15)).toBe(true);
    expect(isOptionAffordable(paid, 14)).toBe(false);
  });

  it('бесплатный вариант и награда доступны всегда, даже с пустым кошельком', () => {
    expect(isOptionAffordable(free, 0)).toBe(true);
    expect(isOptionAffordable(reward, 0)).toBe(true);
  });
});

describe('content/adventure_events.json', () => {
  const templates = adventureEventsJson as AdventureEventTemplate[];

  it('в каждом событии есть бесплатный вариант — ребёнок никогда не остаётся без выбора', () => {
    for (const template of templates) {
      expect(template.options.some((o) => o.coinAmount >= 0)).toBe(true);
    }
  });

  it('шаблонов не меньше лимита событий — без повторов хватает на всё приключение', () => {
    expect(templates.length).toBeGreaterThanOrEqual(EVENT_PACING.maxPerAdventure);
  });
});

describe('selectEventPool (категории событий по состоянию игрока)', () => {
  const normalTpl = makeTemplate('normal', ['normal']);
  const lowMoneyTpl = makeTemplate('low_money', ['low_money']);
  const lowEnergyTpl = makeTemplate('low_energy', ['low_energy']);
  const templates = [normalTpl, lowMoneyTpl, lowEnergyTpl];

  it('отдаёт normal-пул при обычном балансе/энергии', () => {
    const result = selectEventPool(templates, { balance: 100, mood: 80, projectedIncome: 100 });
    expect(result).toEqual([normalTpl]);
  });

  it('отдаёт low_money-пул, когда баланс меньше 20% дохода приключения', () => {
    const result = selectEventPool(templates, { balance: 10, mood: 80, projectedIncome: 100 });
    expect(result).toEqual([lowMoneyTpl]);
  });

  it('отдаёт low_energy-пул при mood <= 20 (та же граница, что у sleeping)', () => {
    const result = selectEventPool(templates, { balance: 100, mood: 20, projectedIncome: 100 });
    expect(result).toEqual([lowEnergyTpl]);
  });

  it('объединяет пулы, если применимо сразу несколько условий', () => {
    const result = selectEventPool(templates, { balance: 5, mood: 10, projectedIncome: 100 });
    expect(result).toEqual(expect.arrayContaining([lowMoneyTpl, lowEnergyTpl]));
    expect(result).toHaveLength(2);
  });

  it('не оставляет пустой список, если ни один шаблон не подходит', () => {
    const onlyNormal = [makeTemplate('a', ['normal'])];
    const result = selectEventPool(onlyNormal, { balance: 5, mood: 10, projectedIncome: 100 });
    expect(result).toEqual(onlyNormal);
  });
});

describe('контент событий: скинов нет', () => {
  it('ни один вариант события не выдаёт скин — облик питомца только за уровень', () => {
    for (const template of adventureEventsJson as AdventureEventTemplate[]) {
      for (const option of template.options) {
        expect(option).not.toHaveProperty('grantsSkin');
      }
    }
  });
});
