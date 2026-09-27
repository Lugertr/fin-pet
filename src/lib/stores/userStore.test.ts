// lib/stores/userStore.test.ts
// Жёсткое правило «отрицательный баланс невозможен» держится в самом леджере,
// а «монет заработано» не считает перевод из своих же накоплений.

import { useLifetimeStatsStore } from './lifetimeStatsStore';
import { useUserStore } from './userStore';

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
  useUserStore.getState().reset();
  useLifetimeStatsStore.getState().reset();
});

describe('userStore.recordTransaction', () => {
  it('отклоняет операцию, после которой баланс стал бы отрицательным', () => {
    seedWallet(10);

    const ok = useUserStore.getState().recordTransaction(-20, 'purchase', 'Тест');

    expect(ok).toBe(false);
    expect(useUserStore.getState().user?.liquid_balance).toBe(10);
  });

  it('списание в пределах баланса проходит', () => {
    seedWallet(10);

    expect(useUserStore.getState().recordTransaction(-10, 'purchase')).toBe(true);
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
  });

  it('снятие из накоплений не считается заработком, награда — считается', () => {
    seedWallet(0);

    useUserStore.getState().recordTransaction(30, 'savings_withdraw');
    expect(useLifetimeStatsStore.getState().lifetimeCoinsEarned).toBe(0);

    useUserStore.getState().recordTransaction(30, 'lesson_reward');
    expect(useLifetimeStatsStore.getState().lifetimeCoinsEarned).toBe(30);
  });
});
