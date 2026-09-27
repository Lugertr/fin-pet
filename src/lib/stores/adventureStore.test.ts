// lib/stores/adventureStore.test.ts
// CLAUDE.md: «план vs факт за период» (здесь — за приключение, полностью
// заменившее период, см. память проекта) + рост уровня как замена роста
// стадии по успешным периодам.

import { AdventureRecord } from '@/domain/adventure/Adventure';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { SHOP_CATALOG, useShopStore } from '@/lib/hooks/useShop';
import { ADVENTURE_XP, useAdventureStore } from './adventureStore';
import { usePetStore } from './petStore';
import { useSavingsStore } from './savingsStore';
import { useUserStore } from './userStore';

function seedActiveAdventure(overrides: Partial<AdventureRecord> = {}): void {
  useAdventureStore.setState({
    isLoading: false,
    currentAdventure: {
      id: 1,
      profileId: 'test-profile',
      adventureNumber: 1,
      status: 'active',
      branchId: 1,
      projectedIncome: 100,
      budget: 100,
      plan: { mandatory: 40, optional: 30, savings: 30 },
      fact: { mandatory: 0, optional: 0, savings: 0 },
      startedAt: new Date().toISOString(),
      plannedEndAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      timeAdjustmentMs: 0,
      questsCompleted: 0,
      xpAwarded: null,
      pendingEventTemplateId: null,
      pendingEventRolledAt: null,
      nextEventCheckAt: null,
      ...overrides,
    },
  });
}

function seedWallet(liquidBalance: number): void {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: liquidBalance,
    created_at: new Date().toISOString(),
    is_demo: false,
  });
}

beforeEach(() => {
  useAdventureStore.setState({
    currentAdventure: null,
    isLoading: true,
    usedEventTemplateIds: [],
    lastCompletionSummary: null,
  });
  usePetStore.setState({ currentMood: 80 });
  useUserStore.getState().reset();
  useShopStore.getState().resetInventory();
  useLessonsStore.getState().resetProgress();
});

describe('adventureStore.recordFact (план vs факт)', () => {
  it('накапливает факт по категории при повторных вызовах', async () => {
    seedActiveAdventure();
    await useAdventureStore.getState().recordFact('mandatory', 15);
    await useAdventureStore.getState().recordFact('mandatory', 5);
    expect(useAdventureStore.getState().currentAdventure?.fact.mandatory).toBe(20);
  });

  it('без активного приключения — тихий no-op, без исключений', async () => {
    await expect(useAdventureStore.getState().recordFact('mandatory', 10)).resolves.not.toThrow();
  });

  it('магазин — контур хаба: покупка во время приключения не пишется в его факт', () => {
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

describe('adventureStore.registerQuestCompletion (ускорение таймера заданиями)', () => {
  it('сокращает оставшееся время и увеличивает счётчик пройденных заданий', async () => {
    seedActiveAdventure();
    const before = useAdventureStore.getState().currentAdventure!;

    await useAdventureStore.getState().registerQuestCompletion();

    const after = useAdventureStore.getState().currentAdventure!;
    expect(new Date(after.plannedEndAt!).getTime()).toBeLessThan(
      new Date(before.plannedEndAt!).getTime()
    );
    expect(after.questsCompleted).toBe(1);
  });
});

// Приключение, у которого время уже вышло (см. adventureProgressRatio) —
// используется там, где тест проверяет НЕ пропорциональное урезание награды
// за досрочное завершение, а саму логику бонуса/опыта при ПОЛНОЙ награде.
const TIME_UP_OVERRIDES: Partial<AdventureRecord> = {
  startedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
  plannedEndAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
};

describe('adventureStore.completeAdventure', () => {
  it('блокируется, пока есть нерешённое событие', async () => {
    seedActiveAdventure({ pendingEventTemplateId: 'snack' });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result).toBeNull();
    expect(useAdventureStore.getState().currentAdventure).not.toBeNull();
  });

  it('начисляет бонус за план, когда факт не превышает план', async () => {
    seedWallet(0);
    seedActiveAdventure({
      ...TIME_UP_OVERRIDES,
      fact: { mandatory: 40, optional: 30, savings: 0 },
    });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.bonusAwarded).toBeGreaterThan(0);
    expect(useAdventureStore.getState().currentAdventure).toBeNull();
  });

  it('не начисляет бонус за план, когда факт превышает план', async () => {
    seedWallet(0);
    seedActiveAdventure({
      ...TIME_UP_OVERRIDES,
      fact: { mandatory: 41, optional: 30, savings: 0 },
    });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.bonusAwarded).toBe(0);
  });

  it('зачисляет опыт в систему уровней игрока (замена роста стадии по успешным периодам)', async () => {
    seedWallet(0);
    seedActiveAdventure(TIME_UP_OVERRIDES);
    const xpBefore = useLessonsStore.getState().totalXp;

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.xpAwarded).toBeGreaterThan(0);
    expect(useLessonsStore.getState().totalXp).toBe(xpBefore + (result?.xpAwarded ?? 0));
  });

  it('обычное завершение (время вышло) даёт completionRatio 1 и полную награду', async () => {
    seedWallet(0);
    seedActiveAdventure({
      ...TIME_UP_OVERRIDES,
      questsCompleted: 2,
      fact: { mandatory: 40, optional: 30, savings: 0 },
    });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBe(1);
    expect(result?.bonusAwarded).toBe(10); // PLAN_BONUS полностью
  });

  it('досрочное завершение пропорционально уменьшает бонус за план и опыт', async () => {
    seedWallet(0);
    // Ровно половина 8-часового приключения прошла -> ratio 0.5.
    const startedAt = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const plannedEndAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    seedActiveAdventure({
      startedAt,
      plannedEndAt,
      questsCompleted: 2,
      fact: { mandatory: 40, optional: 30, savings: 0 },
    });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBeCloseTo(0.5);
    expect(result?.bonusAwarded).toBe(5); // floor(10 * 0.5)
    // Награда меньше полной, но никогда не отрицательная/не наказание — просто урезанная.
    expect(result?.bonusAwarded).toBeGreaterThanOrEqual(0);
  });
});

describe('adventureStore.resolveEvent (желаемое — обычная трата без предметов)', () => {
  // 'snack'/'treat' — реальный шаблон+вариант из content/adventure_events.json.
  // Скины события не выдают (облик питомца — только за уровень, решение 27.09.2026).
  it('списывает цену из контента с бюджета приключения, пишет в «хочу» и ничего не выдаёт', async () => {
    seedWallet(0);
    seedActiveAdventure({ pendingEventTemplateId: 'snack', budget: 100 });
    const ownedBefore = { ...useShopStore.getState().ownedItems };

    await useAdventureStore.getState().resolveEvent('treat');

    expect(useAdventureStore.getState().currentAdventure?.budget).toBe(100 - 15);
    expect(useAdventureStore.getState().currentAdventure?.fact.optional).toBe(15);
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
    expect(useShopStore.getState().ownedItems).toEqual(ownedBefore);
    expect(useAdventureStore.getState().currentAdventure?.pendingEventTemplateId).toBeNull();
  });
});

describe('adventureStore.resolveEvent (§12.3 — без частичной оплаты)', () => {
  it('отклоняет платный вариант, на который не хватает денег: баланс не меняется, событие остаётся', async () => {
    // 'repair'/'master' — реальный вариант из контента, стоит 25 монет.
    seedActiveAdventure({ pendingEventTemplateId: 'repair', budget: 10 });

    await useAdventureStore.getState().resolveEvent('master');

    expect(useAdventureStore.getState().currentAdventure?.budget).toBe(10);
    expect(useAdventureStore.getState().currentAdventure?.pendingEventTemplateId).toBe('repair');
    expect(useAdventureStore.getState().currentAdventure?.fact.mandatory).toBe(0);
  });

  it('бесплатный вариант доступен и с пустым кошельком, решённое событие попадает в список выпавших', async () => {
    seedActiveAdventure({ pendingEventTemplateId: 'repair', budget: 0 });

    await useAdventureStore.getState().resolveEvent('fix_myself');

    expect(useAdventureStore.getState().currentAdventure?.pendingEventTemplateId).toBeNull();
    expect(useAdventureStore.getState().usedEventTemplateIds).toEqual(['repair']);
  });

  it('после окончания времени выбор не применяется', async () => {
    seedActiveAdventure({ ...TIME_UP_OVERRIDES, pendingEventTemplateId: 'repair', budget: 1000 });

    await useAdventureStore.getState().resolveEvent('master');

    expect(useAdventureStore.getState().currentAdventure?.budget).toBe(1000);
  });
});

describe('adventureStore.checkForDueEvent (ритм событий)', () => {
  const MIN = 60 * 1000;

  it('при заходе на экран событие появляется через 30 мин, обычная проверка ждёт час', async () => {
    seedWallet(100);
    const accelerated = {
      startedAt: new Date(Date.now() - 35 * MIN).toISOString(),
      nextEventCheckAt: new Date(Date.now() + 25 * MIN).toISOString(),
    };

    seedActiveAdventure(accelerated);
    await useAdventureStore.getState().checkForDueEvent('tick');
    expect(useAdventureStore.getState().currentAdventure?.pendingEventTemplateId).toBeNull();

    seedActiveAdventure(accelerated);
    await useAdventureStore.getState().checkForDueEvent('entry');
    expect(useAdventureStore.getState().currentAdventure?.pendingEventTemplateId).not.toBeNull();
  });

  it('после окончания времени событие не рождается', async () => {
    seedWallet(100);
    seedActiveAdventure({
      ...TIME_UP_OVERRIDES,
      nextEventCheckAt: new Date(Date.now() - 2 * 60 * MIN).toISOString(),
    });

    await useAdventureStore.getState().checkForDueEvent('entry');

    expect(useAdventureStore.getState().currentAdventure?.pendingEventTemplateId).toBeNull();
  });
});

describe('adventureStore.registerQuestCompletion после окончания времени', () => {
  it('засчитывает задание, но не продлевает закончившееся приключение', async () => {
    seedActiveAdventure(TIME_UP_OVERRIDES);
    const endBefore = useAdventureStore.getState().currentAdventure!.plannedEndAt;

    await useAdventureStore.getState().registerQuestCompletion();

    const after = useAdventureStore.getState().currentAdventure!;
    expect(after.plannedEndAt).toBe(endBefore);
    expect(after.questsCompleted).toBe(1);
  });
});

describe('adventureStore.completeIfExpired (автозавершение по времени)', () => {
  it('ничего не делает, пока время не вышло', async () => {
    seedActiveAdventure();

    const result = await useAdventureStore.getState().completeIfExpired();

    expect(result).toBeNull();
    expect(useAdventureStore.getState().currentAdventure).not.toBeNull();
    expect(useAdventureStore.getState().lastCompletionSummary).toBeNull();
  });

  it('завершает истёкшее приключение, снимая висящее событие без денежных эффектов', async () => {
    seedWallet(0);
    seedActiveAdventure({
      ...TIME_UP_OVERRIDES,
      pendingEventTemplateId: 'repair',
      fact: { mandatory: 40, optional: 30, savings: 0 },
    });

    const result = await useAdventureStore.getState().completeIfExpired();

    expect(result?.autoCompleted).toBe(true);
    expect(result?.completionRatio).toBe(1);
    // Событие «Позвать мастера» (-25 монет) не применилось: весь бюджет (100) +
    // бонус за план ушли в хаб (банк не загружен — всё в кошелёк).
    expect(useUserStore.getState().user?.liquid_balance).toBe(100 + (result?.bonusAwarded ?? 0));
    expect(useAdventureStore.getState().currentAdventure).toBeNull();
    expect(useAdventureStore.getState().lastCompletionSummary).toBe(result);
  });

  it('параллельные вызовы начисляют награды ровно один раз', async () => {
    seedWallet(0);
    seedActiveAdventure(TIME_UP_OVERRIDES);
    const xpBefore = useLessonsStore.getState().totalXp;

    const results = await Promise.all([
      useAdventureStore.getState().completeIfExpired(),
      useAdventureStore.getState().completeIfExpired(),
      useAdventureStore.getState().completeAdventure(),
    ]);

    const completed = results.filter((r) => r !== null);
    expect(completed).toHaveLength(1);
    expect(useLessonsStore.getState().totalXp).toBe(xpBefore + completed[0]!.xpAwarded);
  });

  it('ручное завершение тоже кладёт итоги для показа на хабе', async () => {
    seedWallet(0);
    seedActiveAdventure(TIME_UP_OVERRIDES);

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.autoCompleted).toBe(false);
    expect(useAdventureStore.getState().lastCompletionSummary).toBe(result);
    useAdventureStore.getState().dismissCompletionSummary();
    expect(useAdventureStore.getState().lastCompletionSummary).toBeNull();
  });
});

describe('adventureStore — демо-режим (§18.2)', () => {
  it('завершение в демо сразу после старта даёт полную награду (приключения без ожидания)', async () => {
    useUserStore.getState().setUser({
      id: 'test-profile',
      username: 'Тест',
      liquid_balance: 0,
      created_at: new Date().toISOString(),
      is_demo: true,
    });
    seedActiveAdventure({ fact: { mandatory: 40, optional: 30, savings: 0 } });
    const xpBefore = useLessonsStore.getState().totalXp;

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBe(1);
    expect(result?.bonusAwarded).toBe(10);
    expect(useLessonsStore.getState().totalXp).toBe(xpBefore + (result?.xpAwarded ?? 0));
    expect(result?.xpAwarded).toBeGreaterThan(0);
  });
});

describe('adventureStore — бюджет приключения (отдельный контур денег)', () => {
  it('доход приключения идёт в его бюджет, а не в кошелёк хаба', async () => {
    seedWallet(0);
    seedActiveAdventure({ status: 'planning', budget: 0, startedAt: null, plannedEndAt: null });

    await useAdventureStore.getState().confirmPlan();

    expect(useAdventureStore.getState().currentAdventure?.budget).toBe(100);
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
  });

  it('при завершении «коплю» уходит в банк, остаток — в кошелёк', async () => {
    seedWallet(0);
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
    // план: надо 40, хочу 30, коплю 30; траты в пределах плана -> бонус 10
    seedActiveAdventure({ ...TIME_UP_OVERRIDES, budget: 100 });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.toBank).toBe(30);
    expect(result?.toWallet).toBe(80); // 100 + 10 бонуса − 30 в банк
    expect(useSavingsStore.getState().savings?.currentAmount).toBe(30);
    expect(useUserStore.getState().user?.liquid_balance).toBe(80);
    useSavingsStore.setState({ savings: null });
  });

  it('досрочно на 10% — выплачивается только 10% бюджета и «коплю», без бонуса банка', async () => {
    seedWallet(0);
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
    // 48 минут из 8 часов = 10%; план: коплю 30, траты в плане -> бонус за план 10.
    seedActiveAdventure({
      budget: 100,
      startedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      plannedEndAt: new Date(Date.now() + (8 * 60 - 48) * 60 * 1000).toISOString(),
    });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.completionRatio).toBeCloseTo(0.1, 2);
    // floor((100 + 10) × 0.1) = 11: в банк floor(30 × 0.1) = 3, в кошелёк 8.
    expect(result?.toBank).toBe(3);
    expect(result?.toWallet).toBe(8);
    expect(result?.bankBonus).toBe(0);
    expect(useUserStore.getState().user?.liquid_balance).toBe(8);
    useSavingsStore.setState({ savings: null });
  });

  it('опыт — только за завершение приключения: фиксированно 150', async () => {
    seedWallet(0);
    seedActiveAdventure({ ...TIME_UP_OVERRIDES, questsCompleted: 5 });

    const result = await useAdventureStore.getState().completeAdventure();

    expect(result?.xpAwarded).toBe(ADVENTURE_XP);
    expect(ADVENTURE_XP).toBe(150);
  });
});

describe('adventureStore.registerArcadeRound (Аркада ускоряет, но слабее урока)', () => {
  it('сдвигает финиш на переданные минуты и не считает раунд заданием', async () => {
    seedActiveAdventure();
    const before = useAdventureStore.getState().currentAdventure!;

    const saved = await useAdventureStore.getState().registerArcadeRound(15);

    const after = useAdventureStore.getState().currentAdventure!;
    expect(saved).toBe(15);
    expect(new Date(before.plannedEndAt!).getTime() - new Date(after.plannedEndAt!).getTime()).toBe(
      15 * 60_000
    );
    expect(after.questsCompleted).toBe(before.questsCompleted);
  });

  it('раунд без верных ответов (0 минут) ничего не меняет', async () => {
    seedActiveAdventure();
    const before = useAdventureStore.getState().currentAdventure!;

    const saved = await useAdventureStore.getState().registerArcadeRound(0);

    expect(saved).toBe(0);
    expect(useAdventureStore.getState().currentAdventure?.plannedEndAt).toBe(before.plannedEndAt);
  });
});
