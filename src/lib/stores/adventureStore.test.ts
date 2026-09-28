// lib/stores/adventureStore.test.ts
// CLAUDE.md: «план vs факт за период» (здесь — за смену «Работа», заменившую
// период и приключение, см. память проекта). Смена = один урок (решение
// 28.09.2026): доля выплаты — доля пройденного урока, урок пройден — полная.
// Опыта смена не даёт — его дают уроки (useLessons.rewards.test.ts).

import { AdventureRecord } from '@/domain/adventure/Adventure';
import { planForLesson } from '@/domain/lesson/LessonPlan';
import { LessonProgressState, createLessonProgress } from '@/domain/lesson/lessonProgress';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { SHOP_CATALOG, useShopStore } from '@/lib/hooks/useShop';
import { ADVENTURE_DURATION_MS, useAdventureStore } from './adventureStore';
import { usePetStore } from './petStore';
import { useSavingsStore } from './savingsStore';
import { useUserStore } from './userStore';

/** Урок смены в тестах — первый урок ветки «Бюджет» (формат этапов). */
const SHIFT_LESSON = LESSONS.find((l) => l.branch_id === 1 && l.order_index === 1)!;
const SHIFT_PLAN = planForLesson(SHIFT_LESSON);

function seedActiveAdventure(overrides: Partial<AdventureRecord> = {}): void {
  useAdventureStore.setState({
    isLoading: false,
    currentAdventure: {
      id: 1,
      profileId: 'test-profile',
      adventureNumber: 1,
      status: 'active',
      branchId: 1,
      lessonId: SHIFT_LESSON.id,
      projectedIncome: 100,
      walletContribution: 0,
      budget: 100,
      plan: { mandatory: 40, optional: 30, savings: 30 },
      fact: { mandatory: 0, optional: 0, savings: 0 },
      startedAt: new Date().toISOString(),
      plannedEndAt: new Date(Date.now() + ADVENTURE_DURATION_MS).toISOString(),
      completedAt: null,
      xpAwarded: null,
      ...overrides,
    },
  });
}

/** Состояние урока смены: пройдено nodesDone этапов (все — урок завершён). */
function seedShiftLesson(nodesDone: number): void {
  let state: LessonProgressState = createLessonProgress(SHIFT_LESSON.id);
  for (const node of SHIFT_PLAN.nodes.slice(0, nodesDone)) {
    state = { ...state, readNodes: [...state.readNodes, node.index] };
    for (const activity of node.activities) {
      state = {
        ...state,
        results: {
          ...state.results,
          [activity.id]: { completed: true, perfect: true, attempts: 1 },
        },
      };
    }
  }
  if (nodesDone >= SHIFT_PLAN.nodes.length) {
    state = { ...state, completedAt: new Date().toISOString() };
  }
  useLessonsStore.setState({ lessonStates: { [SHIFT_LESSON.id]: state } });
}

function seedWallet(liquidBalance: number, isDemo = false): void {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: liquidBalance,
    created_at: new Date().toISOString(),
    is_demo: isDemo,
  });
}

function seedBank(): void {
  useSavingsStore.setState({
    isLoading: false,
    savings: {
      id: 1,
      profileId: 'test-profile',
      currentAmount: 0,
      bonusRate: 1,
      targetItemId: null,
      periodsSinceWithdrawal: 0,
      withdrawalCredit: 0,
    },
  });
}

/** 24 часа смены уже вышли. */
const TIME_UP_OVERRIDES: Partial<AdventureRecord> = {
  startedAt: new Date(Date.now() - ADVENTURE_DURATION_MS - 60_000).toISOString(),
  plannedEndAt: new Date(Date.now() - 60_000).toISOString(),
};

beforeEach(() => {
  useAdventureStore.setState({
    currentAdventure: null,
    isLoading: true,
    lastCompletionSummary: null,
  });
  usePetStore.setState({ currentMood: 80 });
  useUserStore.getState().reset();
  useShopStore.getState().resetInventory();
  useLessonsStore.getState().resetProgress();
  useSavingsStore.setState({ savings: null });
});

describe('adventureStore.recordFact (план vs факт)', () => {
  it('накапливает факт по категории при повторных вызовах', async () => {
    seedActiveAdventure();
    await useAdventureStore.getState().recordFact('mandatory', 15);
    await useAdventureStore.getState().recordFact('mandatory', 5);
    expect(useAdventureStore.getState().currentAdventure?.fact.mandatory).toBe(20);
  });

  it('без активной смены — тихий no-op, без исключений', async () => {
    await expect(useAdventureStore.getState().recordFact('mandatory', 10)).resolves.not.toThrow();
  });

  it('магазин — контур хаба: покупка во время смены не пишется в её факт', () => {
    seedActiveAdventure();
    seedWallet(1000);
    const decor = SHOP_CATALOG.find(
      (i) => !i.is_hidden && !i.is_starter && i.category === 'carpet'
    )!;

    useShopStore.getState().purchaseItem(decor.id);

    expect(useAdventureStore.getState().currentAdventure?.fact).toEqual({
      mandatory: 0,
      optional: 0,
      savings: 0,
    });
  });
});

describe('adventureStore.confirmPlan — смена = один урок, 24 часа', () => {
  const planning: Partial<AdventureRecord> = {
    status: 'planning',
    lessonId: null,
    budget: 0,
    startedAt: null,
    plannedEndAt: null,
  };

  it('урок смены — следующий непройденный урок темы, конец через 24 часа', async () => {
    seedWallet(0);
    seedActiveAdventure(planning);

    expect(await useAdventureStore.getState().confirmPlan()).toBe(true);

    const adventure = useAdventureStore.getState().currentAdventure!;
    expect(adventure.status).toBe('active');
    expect(adventure.lessonId).toBe(SHIFT_LESSON.id);
    expect(
      new Date(adventure.plannedEndAt!).getTime() - new Date(adventure.startedAt!).getTime()
    ).toBe(ADVENTURE_DURATION_MS);
  });

  it('доход смены идёт в её бюджет, а не в кошелёк хаба', async () => {
    seedWallet(0);
    seedActiveAdventure(planning);

    await useAdventureStore.getState().confirmPlan();

    expect(useAdventureStore.getState().currentAdventure?.budget).toBe(100);
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
  });

  it('монеты из кошелька: списываются при старте и добавляются в бюджет', async () => {
    seedWallet(80);
    seedActiveAdventure(planning);

    useAdventureStore.getState().setWalletContribution(50);
    expect(await useAdventureStore.getState().confirmPlan()).toBe(true);

    expect(useAdventureStore.getState().currentAdventure).toMatchObject({
      budget: 150,
      walletContribution: 50,
    });
    expect(useUserStore.getState().user?.liquid_balance).toBe(30);
  });

  it('из кошелька не добавить больше, чем в нём есть (§12.3)', async () => {
    seedWallet(20);
    seedActiveAdventure(planning);

    useAdventureStore.getState().setWalletContribution(50);

    expect(useAdventureStore.getState().currentAdventure?.walletContribution).toBe(20);
    await useAdventureStore.getState().confirmPlan();
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
  });

  it('кошелёк опустел до старта — смена не начинается, баланс не в минус', async () => {
    seedWallet(50);
    seedActiveAdventure(planning);
    useAdventureStore.getState().setWalletContribution(50);
    seedWallet(10);

    expect(await useAdventureStore.getState().confirmPlan()).toBe(false);
    expect(useAdventureStore.getState().currentAdventure?.status).toBe('planning');
    expect(useUserStore.getState().user?.liquid_balance).toBe(10);
  });

  it('в пройденной теме урока нет — смена не начинается', async () => {
    seedWallet(0);
    const completedAt = new Date().toISOString();
    useLessonsStore.setState({
      lessonStates: Object.fromEntries(
        LESSONS.filter((l) => l.branch_id === 1).map((l) => [
          l.id,
          { ...createLessonProgress(l.id), completedAt },
        ])
      ),
    });
    seedActiveAdventure(planning);

    expect(await useAdventureStore.getState().confirmPlan()).toBe(false);
    expect(useAdventureStore.getState().currentAdventure?.status).toBe('planning');
  });
});

describe('adventureStore.isShiftLesson', () => {
  it('урок смены — только её урок', () => {
    seedActiveAdventure();
    const other = LESSONS.find((l) => l.branch_id === 1 && l.id !== SHIFT_LESSON.id)!;
    expect(useAdventureStore.getState().isShiftLesson(SHIFT_LESSON.id, 1)).toBe(true);
    expect(useAdventureStore.getState().isShiftLesson(other.id, 1)).toBe(false);
  });

  it('смена старой модели (без урока) — урок её темы', () => {
    seedActiveAdventure({ lessonId: null });
    expect(useAdventureStore.getState().isShiftLesson(SHIFT_LESSON.id, 1)).toBe(true);
    expect(useAdventureStore.getState().isShiftLesson(SHIFT_LESSON.id, 2)).toBe(false);
  });
});

describe('adventureStore.completeAdventure', () => {
  it('урок пройден — полная доля и бонус за план, когда факт не превышает план', async () => {
    seedWallet(0);
    seedShiftLesson(SHIFT_PLAN.nodes.length);
    seedActiveAdventure({ fact: { mandatory: 40, optional: 30, savings: 0 } });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBe(1);
    expect(result?.bonusAwarded).toBe(10);
    expect(result?.lesson).toMatchObject({ id: SHIFT_LESSON.id, finished: true });
    expect(useAdventureStore.getState().currentAdventure).toBeNull();
  });

  it('не начисляет бонус за план, когда факт превышает план', async () => {
    seedWallet(0);
    seedShiftLesson(SHIFT_PLAN.nodes.length);
    seedActiveAdventure({ fact: { mandatory: 41, optional: 30, savings: 0 } });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.bonusAwarded).toBe(0);
  });

  it('опыта смена не даёт — его дают уроки', async () => {
    seedWallet(0);
    seedShiftLesson(SHIFT_PLAN.nodes.length);
    seedActiveAdventure();

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.adventure.xpAwarded).toBe(0);
    expect(useLessonsStore.getState().totalXp).toBe(0);
  });

  it('урок не пройден — доля по пройденным этапам, урок продолжится (итоги знают где)', async () => {
    seedWallet(0);
    seedShiftLesson(1);
    seedActiveAdventure({ fact: { mandatory: 40, optional: 30, savings: 0 } });
    const total = SHIFT_PLAN.nodes.length + 1;

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBeCloseTo(1 / total);
    expect(result?.bonusAwarded).toBe(Math.floor(10 / total));
    expect(result?.lesson).toMatchObject({ nodesDone: 1, nodesTotal: total, finished: false });
    // Прогресс урока не трогается — следующая смена продолжит с того же места.
    expect(useLessonsStore.getState().lessonStates[SHIFT_LESSON.id].readNodes).toEqual([0]);
  });

  it('урок не пройден — монеты из кошелька возвращаются целиком', async () => {
    seedWallet(0);
    seedActiveAdventure({ budget: 150, walletContribution: 50 });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBe(0);
    expect(result!.toWallet + result!.toBank).toBe(50);
  });

  it('ничего не пройдено — выплаты нет, но и наказания нет', async () => {
    seedWallet(0);
    seedActiveAdventure();

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBe(0);
    expect(result?.toWallet).toBe(0);
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
  });
});

describe('adventureStore.completeIfExpired (24 часа вышли)', () => {
  it('ничего не делает, пока время не вышло', async () => {
    seedActiveAdventure();

    const result = await useAdventureStore.getState().completeIfExpired();

    expect(result).toBeNull();
    expect(useAdventureStore.getState().currentAdventure).not.toBeNull();
    expect(useAdventureStore.getState().lastCompletionSummary).toBeNull();
  });

  it('завершает смену с незаконченным уроком — доля по этапам, итоги на хаб', async () => {
    seedWallet(0);
    seedShiftLesson(2);
    seedActiveAdventure(TIME_UP_OVERRIDES);

    const result = await useAdventureStore.getState().completeIfExpired();

    expect(result?.autoCompleted).toBe(true);
    expect(result?.completionRatio).toBeCloseTo(2 / (SHIFT_PLAN.nodes.length + 1));
    expect(useAdventureStore.getState().currentAdventure).toBeNull();
    expect(useAdventureStore.getState().lastCompletionSummary).toBe(result);
  });

  it('параллельные вызовы начисляют награды ровно один раз', async () => {
    seedWallet(0);
    seedShiftLesson(SHIFT_PLAN.nodes.length);
    seedActiveAdventure(TIME_UP_OVERRIDES);

    const results = await Promise.all([
      useAdventureStore.getState().completeIfExpired(),
      useAdventureStore.getState().completeIfExpired(),
      useAdventureStore.getState().completeAdventure(),
    ]);

    const completed = results.filter((r) => r !== null);
    expect(completed).toHaveLength(1);
    // Банк в тесте не загружен — вся выплата в кошелёк, и ровно один раз.
    expect(useUserStore.getState().user?.liquid_balance).toBe(completed[0]!.toWallet);
  });

  it('ручное завершение тоже кладёт итоги для показа на хабе', async () => {
    seedWallet(0);
    seedActiveAdventure();

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.autoCompleted).toBe(false);
    expect(useAdventureStore.getState().lastCompletionSummary).toBe(result);
    useAdventureStore.getState().dismissCompletionSummary();
    expect(useAdventureStore.getState().lastCompletionSummary).toBeNull();
  });
});

describe('adventureStore — демо-режим (§18.2)', () => {
  it('завершение сразу после старта — полная награда (смена без ожидания)', async () => {
    seedWallet(0, true);
    seedActiveAdventure({ fact: { mandatory: 40, optional: 30, savings: 0 } });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBe(1);
    expect(result?.bonusAwarded).toBe(10);
  });
});

describe('adventureStore — бюджет смены (отдельный контур денег)', () => {
  it('урок пройден: «коплю» уходит в банк (с бонусом), остаток — в кошелёк', async () => {
    seedWallet(0);
    seedBank();
    seedShiftLesson(SHIFT_PLAN.nodes.length);
    // план: потратить 70, коплю 30; траты в пределах плана -> бонус 10
    seedActiveAdventure({ budget: 100 });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.toBank).toBe(30);
    expect(result?.toWallet).toBe(80); // 100 + 10 бонуса − 30 в банк
    expect(result?.bankBonus).toBeGreaterThanOrEqual(0);
    expect(useUserStore.getState().user?.liquid_balance).toBe(80);
  });

  it('урок пройден наполовину — выплачивается половина, без бонуса копилки', async () => {
    seedWallet(0);
    seedBank();
    // Урок из 3 этапов + финал: 2 из 4 — ровно половина.
    expect(SHIFT_PLAN.nodes.length + 1).toBe(4);
    seedShiftLesson(2);
    seedActiveAdventure({ budget: 100 });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBe(0.5);
    // floor((100 + 10) × 0.5) = 55: в банк floor(30 × 0.5) = 15, в кошелёк 40.
    expect(result?.toBank).toBe(15);
    expect(result?.toWallet).toBe(40);
    expect(result?.bankBonus).toBe(0);
  });
});

describe('adventureStore.applyLessonEventChoice — события внутри урока', () => {
  const spendNeed = {
    id: 'pay',
    label: 'Заплатить',
    category: 'mandatory' as const,
    coinAmount: -10,
  };
  const spendWant = {
    id: 'buy',
    label: 'Купить',
    category: 'optional' as const,
    coinAmount: -15,
  };
  const reward = { id: 'gift', label: 'Подарок', category: null, coinAmount: 20 };

  it('трата — из бюджета смены в факт «нужно» или «хочу», кошелёк не трогается', async () => {
    seedActiveAdventure({ budget: 100 });
    seedWallet(50);

    expect(await useAdventureStore.getState().applyLessonEventChoice('bus', spendNeed)).toBe(true);
    expect(await useAdventureStore.getState().applyLessonEventChoice('stickers', spendWant)).toBe(
      true
    );

    const adventure = useAdventureStore.getState().currentAdventure!;
    expect(adventure.budget).toBe(75);
    expect(adventure.fact).toMatchObject({ mandatory: 10, optional: 15 });
    expect(useUserStore.getState().user?.liquid_balance).toBe(50);
  });

  it('пополнение увеличивает бюджет', async () => {
    seedActiveAdventure({ budget: 30 });
    await useAdventureStore.getState().applyLessonEventChoice('gift', reward);
    expect(useAdventureStore.getState().currentAdventure?.budget).toBe(50);
  });

  it('не хватает бюджета — выбор отклонён целиком, без ухода в минус', async () => {
    seedActiveAdventure({ budget: 5 });
    expect(await useAdventureStore.getState().applyLessonEventChoice('bus', spendNeed)).toBe(false);
    expect(useAdventureStore.getState().currentAdventure).toMatchObject({
      budget: 5,
      fact: { mandatory: 0 },
    });
  });

  it('без активной смены ничего не меняет', async () => {
    expect(await useAdventureStore.getState().applyLessonEventChoice('bus', spendNeed)).toBe(false);
  });
});
