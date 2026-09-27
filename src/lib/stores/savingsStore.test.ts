// lib/stores/savingsStore.test.ts
// CLAUDE.md: «накопления: перевод, снятие, прогресс к цели, невозможность
// уйти в минус».

import { SHOP_CATALOG, useShopStore } from '../hooks/useShop';
import { BASE_SAVINGS_BONUS_RATE, SavingsRecord } from '@/domain/savings/Savings';
import { useSavingsStore } from './savingsStore';
import { useUserStore } from './userStore';

const GOAL_ITEM = SHOP_CATALOG.find((i) => i.id === 6)!; // «Яблоко», price 20

function seedSavings(overrides: Partial<SavingsRecord> = {}): void {
  useSavingsStore.setState({
    isLoading: false,
    savings: {
      id: 1,
      profileId: 'test-profile',
      currentAmount: 0,
      bonusRate: BASE_SAVINGS_BONUS_RATE,
      targetItemId: null,
      periodsSinceWithdrawal: 0,
      withdrawalCredit: 0,
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
  useUserStore.getState().reset();
  useShopStore.getState().resetInventory();
  useSavingsStore.setState({ savings: null, isLoading: true });
});

describe('savingsStore.deposit (перевод в накопления)', () => {
  it('блокирует перевод, если в кошельке недостаточно монет', async () => {
    seedSavings();
    seedWallet(10);

    const result = await useSavingsStore.getState().deposit(50);

    expect(result.success).toBe(false);
    expect(useSavingsStore.getState().savings?.currentAmount).toBe(0);
    expect(useUserStore.getState().user?.liquid_balance).toBe(10);
  });

  it('списывает сумму с кошелька и зачисляет её (плюс бонус) в накопления', async () => {
    seedSavings();
    seedWallet(100);

    const result = await useSavingsStore.getState().deposit(50);

    expect(result.success).toBe(true);
    expect(useUserStore.getState().user?.liquid_balance).toBe(50);
    // §11.4: bonus = floor((0+50) * 1 / 100) = 0 при базовой ставке 1% — сумма всё равно должна дойти
    expect(useSavingsStore.getState().savings?.currentAmount).toBeGreaterThanOrEqual(50);
  });

  it('отклоняет перевод нулевой или отрицательной суммы', async () => {
    seedSavings();
    seedWallet(100);

    const result = await useSavingsStore.getState().deposit(0);

    expect(result.success).toBe(false);
    expect(useUserStore.getState().user?.liquid_balance).toBe(100);
  });
});

describe('savingsStore.withdraw (снятие, невозможность уйти в минус)', () => {
  it('блокирует снятие суммы больше, чем отложено', async () => {
    seedSavings({ currentAmount: 30 });
    seedWallet(0);

    const result = await useSavingsStore.getState().withdraw(50);

    expect(result.success).toBe(false);
    expect(useSavingsStore.getState().savings?.currentAmount).toBe(30);
  });

  it('переводит снятую сумму в кошелёк и обнуляет стрик удержания', async () => {
    seedSavings({ currentAmount: 100, periodsSinceWithdrawal: 2 });
    seedWallet(0);

    const result = await useSavingsStore.getState().withdraw(40);

    expect(result.success).toBe(true);
    expect(useSavingsStore.getState().savings?.currentAmount).toBe(60);
    expect(useUserStore.getState().user?.liquid_balance).toBe(40);
    expect(useSavingsStore.getState().savings?.periodsSinceWithdrawal).toBe(0);
  });

  it('накопления никогда не уходят в минус даже при снятии всей суммы', async () => {
    seedSavings({ currentAmount: 20 });
    seedWallet(0);

    await useSavingsStore.getState().withdraw(20);
    const afterFullWithdraw = useSavingsStore.getState().savings?.currentAmount ?? -1;
    expect(afterFullWithdraw).toBe(0);

    const overWithdraw = await useSavingsStore.getState().withdraw(1);
    expect(overWithdraw.success).toBe(false);
    expect(useSavingsStore.getState().savings?.currentAmount).toBeGreaterThanOrEqual(0);
  });
});

describe('savingsStore — прогресс и достижение цели (§11.2-11.3)', () => {
  it('накопление ниже цены цели не завершает её', async () => {
    seedSavings({ targetItemId: GOAL_ITEM.id, currentAmount: 0 });
    seedWallet(1000);

    await useSavingsStore.getState().deposit(GOAL_ITEM.price - 5);

    expect(useSavingsStore.getState().savings?.targetItemId).toBe(GOAL_ITEM.id);
  });

  it('достижение цены цели завершает цель и добавляет предмет в инвентарь', async () => {
    seedSavings({ targetItemId: GOAL_ITEM.id, currentAmount: 0 });
    seedWallet(1000);

    await useSavingsStore.getState().deposit(GOAL_ITEM.price);

    expect(useSavingsStore.getState().savings?.targetItemId).toBeNull();
    expect(useShopStore.getState().ownedItems[GOAL_ITEM.id]).toBeGreaterThanOrEqual(1);
  });
});

describe('savingsStore — бонус только за новые деньги (без фарма)', () => {
  it('снятие и возврат тех же монет бонуса не дают', async () => {
    seedSavings({ currentAmount: 1000 });
    seedWallet(0);

    await useSavingsStore.getState().withdraw(500);
    await useSavingsStore.getState().deposit(500);

    // Раньше каждое пополнение давало 1% от всей суммы — здесь было бы +10.
    expect(useSavingsStore.getState().savings?.currentAmount).toBe(1000);
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
  });

  it('пополнения по 1 монете при большой сумме в банке бонуса не дают', async () => {
    seedSavings({ currentAmount: 1000 });
    seedWallet(5);

    for (let i = 0; i < 5; i++) await useSavingsStore.getState().deposit(1);

    expect(useSavingsStore.getState().savings?.currentAmount).toBe(1005);
  });

  it('«коплю» из приключения — новые деньги: бонус на всю сумму, кошелёк не трогается', async () => {
    seedSavings({ currentAmount: 0 });
    seedWallet(0);

    const bonus = await useSavingsStore.getState().depositFromAdventure(200);

    expect(bonus).toBe(2); // 1% от 200
    expect(useSavingsStore.getState().savings?.currentAmount).toBe(202);
    expect(useUserStore.getState().user?.liquid_balance).toBe(0);
  });
});

describe('savingsStore.setTarget — цель только из магазина', () => {
  // Облик питомца, трофей или стартовую вещь накоплением не получить:
  // облики приходят с уровнем, трофеи — в подарках, стартовые есть у всех.
  it('облик питомца, скрытый трофей и стартовую вещь выбрать целью нельзя', async () => {
    seedSavings();
    const skin = SHOP_CATALOG.find((i) => i.category === 'skin' && i.pet_type === 'robot')!;
    const trophy = SHOP_CATALOG.find((i) => i.is_hidden)!;
    const starter = SHOP_CATALOG.find((i) => i.is_starter)!;

    for (const item of [skin, trophy, starter]) {
      await useSavingsStore.getState().setTarget(item.id);
      expect(useSavingsStore.getState().savings?.targetItemId).toBeNull();
    }
  });

  it('вещь из магазина выбрать целью можно', async () => {
    seedSavings();
    const laptop = SHOP_CATALOG.find((i) => i.category === 'laptop' && !i.is_starter)!;

    await useSavingsStore.getState().setTarget(laptop.id);

    expect(useSavingsStore.getState().savings?.targetItemId).toBe(laptop.id);
  });
});

describe('savingsStore.setTarget — только ноутбук, копилка или кровать', () => {
  it('декор и еду выбрать целью нельзя', async () => {
    seedSavings();
    const decor = SHOP_CATALOG.find((i) => i.category === 'carpet' && !i.is_starter)!;
    const food = SHOP_CATALOG.find((i) => i.category === 'food')!;

    for (const item of [decor, food]) {
      await useSavingsStore.getState().setTarget(item.id);
      expect(useSavingsStore.getState().savings?.targetItemId).toBeNull();
    }
  });
});
