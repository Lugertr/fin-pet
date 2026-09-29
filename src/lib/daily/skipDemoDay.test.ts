// lib/daily/skipDemoDay.test.ts
// Демо-режим, «Пропустить день»: окно ежедневной награды появляется сразу,
// стрик продолжается, пропуск без награды его прерывает; вне демо — ничего.
// Вместо SQLite — репозиторий в памяти.

import { shouldOfferDailyReward } from '@/domain/daily/DailyReward';
import { useDailyStore } from '@/lib/hooks/useDaily';
import { useUserStore } from '@/lib/stores/userStore';
import { claimDailyReward } from './claimDailyReward';
import { skipDemoDay } from './skipDemoDay';

const mockCreatedAt = new Map<string, string>();

jest.mock('@/data/local/repositories', () => ({
  ...jest.requireActual('@/data/local/repositories'),
  getProfileRepository: () => ({
    setCreatedAt: async (id: string, createdAt: string) => {
      mockCreatedAt.set(id, createdAt);
    },
    updateBalance: async () => {},
  }),
  getTransactionRepository: () => ({ add: async () => {} }),
}));

function seedUser(isDemo: boolean): void {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: isDemo,
  });
}

function offered(): boolean {
  return shouldOfferDailyReward({
    profileCreatedAt: useUserStore.getState().user?.created_at,
    lastClaimDate: useDailyStore.getState().lastClaimDate,
    now: new Date(),
  });
}

beforeEach(() => {
  mockCreatedAt.clear();
  useDailyStore.setState({
    currentStreak: 0,
    lastClaimDate: null,
    totalClaimed: 0,
    hasClaimedToday: false,
  });
});

describe('skipDemoDay — «Пропустить день» в демо', () => {
  it('в день создания награды нет, после пропуска — есть; дата сохранена в профиль', async () => {
    seedUser(true);
    expect(offered()).toBe(false);

    expect(await skipDemoDay()).toBe(true);

    expect(offered()).toBe(true);
    expect(mockCreatedAt.get('test-profile')).toBe(useUserStore.getState().user?.created_at);
  });

  it('награда каждый «день» — стрик растёт', async () => {
    seedUser(true);
    for (let day = 1; day <= 3; day += 1) {
      await skipDemoDay();
      expect(claimDailyReward().newStreak).toBe(day);
      expect(offered()).toBe(false);
    }
  });

  it('пропуск без награды прерывает стрик, как настоящий', async () => {
    seedUser(true);
    await skipDemoDay();
    claimDailyReward();
    await skipDemoDay();
    claimDailyReward(); // стрик 2

    await skipDemoDay();
    await skipDemoDay(); // день без награды

    expect(useDailyStore.getState().currentStreak).toBe(0);
    expect(claimDailyReward().newStreak).toBe(1);
  });

  it('вне демо ничего не меняет', async () => {
    seedUser(false);
    const createdAt = useUserStore.getState().user?.created_at;

    expect(await skipDemoDay()).toBe(false);

    expect(useUserStore.getState().user?.created_at).toBe(createdAt);
    expect(mockCreatedAt.size).toBe(0);
  });
});
