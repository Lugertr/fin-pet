// lib/stores/adventureStore.settlement.test.ts
// §4.5 «прогресс не теряется»: завершение смены и выплата (смена, банк,
// кошелёк, итоги) пишутся одной транзакцией SQLite. Не записалось — не
// применяется ничего: смена остаётся активной, монеты не появляются и не
// теряются, повторное завершение платит ровно один раз.

import { AdventureRecord } from '@/domain/adventure/Adventure';
import { runInTransaction } from '@/data/local/transaction';
import { ADVENTURE_DURATION_MS, useAdventureStore } from './adventureStore';
import { useSavingsStore } from './savingsStore';
import { useUserStore } from './userStore';

jest.mock('@/data/local/transaction', () => ({
  runInTransaction: jest.fn(async (work: () => Promise<void>) => work()),
}));

const mockedRunInTransaction = runInTransaction as jest.MockedFunction<typeof runInTransaction>;

/** Смена старой модели (без урока) — выплата полная, без подготовки урока. */
const ACTIVE: AdventureRecord = {
  id: 11,
  profileId: 'p',
  adventureNumber: 5,
  status: 'active',
  branchId: 1,
  lessonId: null,
  projectedIncome: 100,
  walletContribution: 0,
  coffeeBought: false,
  stagesDoneAtStart: 0,
  budget: 100,
  plan: { mandatory: 40, optional: 0, savings: 0 },
  fact: { mandatory: 0, optional: 0, savings: 0 },
  startedAt: new Date().toISOString(),
  plannedEndAt: new Date(Date.now() + ADVENTURE_DURATION_MS).toISOString(),
  completedAt: null,
  xpAwarded: null,
};

beforeEach(() => {
  mockedRunInTransaction.mockImplementation(async (work) => work());
  useUserStore.getState().setUser({
    id: 'p',
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: false,
  });
  useSavingsStore.setState({ savings: null });
  useAdventureStore.setState({
    isLoading: false,
    currentAdventure: ACTIVE,
    lastCompletionSummary: null,
  });
});

it('транзакция не записалась — ничего не применено, смена продолжается', async () => {
  mockedRunInTransaction.mockRejectedValueOnce(new Error('диск занят'));

  expect(await useAdventureStore.getState().completeAdventure()).toBeNull();

  expect(useAdventureStore.getState().currentAdventure).toMatchObject({
    id: ACTIVE.id,
    status: 'active',
  });
  expect(useAdventureStore.getState().lastCompletionSummary).toBeNull();
  expect(useUserStore.getState().user?.liquid_balance).toBe(0);
});

it('после сбоя завершение повторяется и платит ровно один раз', async () => {
  mockedRunInTransaction.mockRejectedValueOnce(new Error('диск занят'));
  await useAdventureStore.getState().completeAdventure();

  const summary = await useAdventureStore.getState().completeAdventure();

  // Бюджет 100 + бонус за план 10 (трат не было), «коплю» нет — всё в кошелёк.
  expect(summary?.toWallet).toBe(110);
  expect(useUserStore.getState().user?.liquid_balance).toBe(110);
  expect(useAdventureStore.getState().currentAdventure).toBeNull();
  expect(await useAdventureStore.getState().completeAdventure()).toBeNull();
  expect(useUserStore.getState().user?.liquid_balance).toBe(110);
});

it('память кошелька меняется только после записи транзакции', async () => {
  let balanceDuringWrite: number | undefined;
  mockedRunInTransaction.mockImplementationOnce(async (work) => {
    await work();
    balanceDuringWrite = useUserStore.getState().user?.liquid_balance;
  });

  await useAdventureStore.getState().completeAdventure();

  expect(balanceDuringWrite).toBe(0);
  expect(useUserStore.getState().user?.liquid_balance).toBe(110);
});
