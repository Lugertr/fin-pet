// lib/stores/adventureStore.summary.test.ts
// §4.5 «полное восстановление после перезапуска»: итоги смены хранятся к
// смене, пока окно итогов не закрыто, — закрыл приложение сразу после урока
// смены, и хаб покажет итоги после перезапуска. Вместо SQLite — репозиторий
// в памяти.

import { AdventureRecord } from '@/domain/adventure/Adventure';
import { useUserStore } from './userStore';
import { ADVENTURE_DURATION_MS, parseCompletionSummary, useAdventureStore } from './adventureStore';

const mockAdventures = new Map<number, AdventureRecord>();
const mockPending = new Map<number, string | null>();

jest.mock('@/data/local/repositories', () => ({
  ...jest.requireActual('@/data/local/repositories'),
  getAdventureRepository: () => ({
    getCurrent: async () => null,
    complete: async (id: number, completedAt: string) => {
      const record = mockAdventures.get(id);
      if (record) mockAdventures.set(id, { ...record, status: 'completed', completedAt });
    },
    addFact: async () => {},
    setBudget: async () => {},
    setPendingSummary: async (id: number, json: string | null) => {
      mockPending.set(id, json);
    },
    getPendingSummary: async (profileId: string) => {
      const record = [...mockAdventures.values()].find(
        (a) => a.profileId === profileId && a.status === 'completed' && mockPending.get(a.id)
      );
      return record ? { adventure: record, summaryJson: mockPending.get(record.id)! } : null;
    },
  }),
}));

const PROFILE = 'test-profile';
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const ACTIVE: AdventureRecord = {
  id: 7,
  profileId: PROFILE,
  adventureNumber: 3,
  status: 'active',
  branchId: 1,
  lessonId: null,
  projectedIncome: 100,
  walletContribution: 0,
  coffeeBought: false,
  stagesDoneAtStart: 0,
  budget: 100,
  plan: { mandatory: 40, optional: 30, savings: 30 },
  fact: { mandatory: 0, optional: 0, savings: 0 },
  startedAt: new Date().toISOString(),
  plannedEndAt: new Date(Date.now() + ADVENTURE_DURATION_MS).toISOString(),
  completedAt: null,
  xpAwarded: null,
};

/** «Перезапуск»: память стора пуста, данные — только в хранилище. */
function restart(): void {
  useAdventureStore.setState({ currentAdventure: null, lastCompletionSummary: null });
}

beforeEach(() => {
  mockAdventures.clear();
  mockPending.clear();
  mockAdventures.set(ACTIVE.id, ACTIVE);
  useAdventureStore.setState({ currentAdventure: ACTIVE, lastCompletionSummary: null });
  useUserStore.getState().setUser({
    id: PROFILE,
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: false,
  });
});

describe('итоги смены переживают перезапуск', () => {
  it('завершение смены сохраняет итоги к смене', async () => {
    const summary = await useAdventureStore.getState().completeAdventure();
    await flush();

    expect(summary).not.toBeNull();
    const stored = JSON.parse(mockPending.get(ACTIVE.id)!);
    expect(stored).toMatchObject({
      toWallet: summary!.toWallet,
      toBank: summary!.toBank,
      completionRatio: summary!.completionRatio,
    });
  });

  it('после перезапуска хаб снова получает непоказанные итоги', async () => {
    const summary = await useAdventureStore.getState().completeAdventure();
    await flush();
    restart();

    await useAdventureStore.getState().loadCurrent(PROFILE);

    const restored = useAdventureStore.getState().lastCompletionSummary;
    expect(restored?.adventure.id).toBe(ACTIVE.id);
    expect(restored?.adventure.status).toBe('completed');
    expect(restored?.toWallet).toBe(summary!.toWallet);
  });

  it('закрытые итоги после перезапуска не возвращаются', async () => {
    await useAdventureStore.getState().completeAdventure();
    await flush();
    useAdventureStore.getState().dismissCompletionSummary();
    await flush();
    expect(mockPending.get(ACTIVE.id)).toBeNull();
    restart();

    await useAdventureStore.getState().loadCurrent(PROFILE);

    expect(useAdventureStore.getState().lastCompletionSummary).toBeNull();
  });

  it('битые сохранённые итоги не показываются', () => {
    expect(parseCompletionSummary(ACTIVE, '{не json')).toBeNull();
    expect(parseCompletionSummary(ACTIVE, JSON.stringify({ toWallet: 'много' }))).toBeNull();
  });

  it('итоги, записанные до 29.09.2026, — этапов к старту смены 0', () => {
    const old = JSON.stringify({
      bonusAwarded: 0,
      toBank: 0,
      bankBonus: 0,
      toWallet: 50,
      completionRatio: 0.5,
      autoCompleted: false,
      lesson: { id: 1, title: 'Урок', nodesDone: 2, nodesTotal: 4, finished: false },
    });
    expect(parseCompletionSummary(ACTIVE, old)?.lesson).toMatchObject({ nodesDoneAtStart: 0 });
  });
});
