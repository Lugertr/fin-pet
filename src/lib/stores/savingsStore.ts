// lib/stores/savingsStore.ts
// Накопления и финансовая цель (§11 ТЗ) — заменяет старую модель «Вклад».

import { getSavingsRepository } from '@/data/local/repositories';
import {
  BASE_SAVINGS_BONUS_RATE,
  GOAL_COMPLETION_BONUS_PERCENT,
  HOLDING_STREAK_PERIODS,
  SavingsRecord,
  computeInteractionBonus,
} from '@/domain/savings/Savings';
import { create } from 'zustand';
import { SHOP_CATALOG, useShopStore } from '../hooks/useShop';
import { useAchievementsStore } from './achievementsStore';
import { useGiftsStore } from './giftsStore';
import { usePeriodStore } from './periodStore';
import { useUserStore } from './userStore';

interface SavingsActionResult {
  success: boolean;
  message: string;
}

interface SavingsState {
  savings: SavingsRecord | null;
  isLoading: boolean;

  loadOrCreate: (profileId: string) => Promise<void>;
  setTarget: (itemId: number | null) => Promise<void>;
  /** Переводит монеты из кошелька в накопления и сразу начисляет бонус (§11.4). */
  deposit: (amount: number) => Promise<SavingsActionResult>;
  /** Возвращает монеты из накоплений в кошелёк, обнуляет стрик удержания (§11.5). */
  withdraw: (amount: number) => Promise<SavingsActionResult>;
  /** Вызывается periodStore при завершении периода — считает стрик «без снятия» (§11.5). */
  registerPeriodOutcome: () => Promise<void>;
  reset: () => void;
}

async function persistSavings(record: SavingsRecord): Promise<void> {
  await getSavingsRepository().update(record);
}

function currentPeriodId(): number | null {
  return usePeriodStore.getState().currentPeriod?.id ?? null;
}

/** §11.3: накоплено ≥ цены цели → покупка → предмет в инвентаре, +10% цены и подарок (§11.5). */
async function checkGoalCompletion(record: SavingsRecord): Promise<SavingsRecord> {
  if (!record.targetItemId) return record;

  const targetItem = SHOP_CATALOG.find((i) => i.id === record.targetItemId);
  if (!targetItem || record.currentAmount < targetItem.price) return record;

  const updated: SavingsRecord = {
    ...record,
    currentAmount: record.currentAmount - targetItem.price,
    targetItemId: null,
  };

  useShopStore.getState().addItem(targetItem.id);

  const bonusCoins = Math.floor((targetItem.price * GOAL_COMPLETION_BONUS_PERCENT) / 100);
  useUserStore
    .getState()
    .recordTransaction(bonusCoins, 'savings_goal_reward', `Цель достигнута: ${targetItem.name}`);

  // §14.1: достижение цели накоплений -> гарантированный выбор 1 из 2 (используем
  // общий источник savings_hold — §14.4 не заводит отдельного тега для цели)
  useGiftsStore
    .getState()
    .addGuaranteedChoiceGift('savings_hold', 2, null, `Накопления: цель «${targetItem.name}»`);

  await getSavingsRepository().addTransaction({
    savingsId: updated.id,
    operationType: 'reward',
    amount: -targetItem.price,
    balanceAfter: updated.currentAmount,
    periodId: currentPeriodId(),
  });

  return updated;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  savings: null,
  isLoading: true,

  loadOrCreate: async (profileId) => {
    set({ isLoading: true });
    try {
      const repo = getSavingsRepository();
      let record = await repo.getByProfileId(profileId);
      if (!record) {
        record = await repo.create(profileId, BASE_SAVINGS_BONUS_RATE);
      }
      set({ savings: record, isLoading: false });
    } catch (error) {
      console.error('[SavingsStore] Не удалось загрузить накопления:', error);
      set({ isLoading: false });
    }
  },

  setTarget: async (itemId) => {
    const { savings } = get();
    if (!savings) return;

    const updated: SavingsRecord = { ...savings, targetItemId: itemId };
    set({ savings: updated });
    await persistSavings(updated);
  },

  deposit: async (amount) => {
    const { savings } = get();
    if (!savings) return { success: false, message: 'Накопления ещё не загружены' };
    if (amount <= 0) return { success: false, message: 'Введите сумму больше нуля' };

    const { user } = useUserStore.getState();
    if (!user || user.liquid_balance < amount) {
      return { success: false, message: 'Недостаточно монет в кошельке' };
    }

    const balanceAfterDeposit = savings.currentAmount + amount;
    const bonus = computeInteractionBonus(balanceAfterDeposit, savings.bonusRate);

    useUserStore.getState().recordTransaction(-amount, 'savings_deposit', 'Перевод в накопления');
    usePeriodStore.getState().recordFact('savings', amount);
    useAchievementsStore.getState().recordSavingsDeposit(); // §15.2 «Первая копилка»

    const repo = getSavingsRepository();
    const periodId = currentPeriodId();
    await repo.addTransaction({
      savingsId: savings.id,
      operationType: 'deposit',
      amount,
      balanceAfter: balanceAfterDeposit,
      periodId,
    });
    if (bonus > 0) {
      await repo.addTransaction({
        savingsId: savings.id,
        operationType: 'bonus',
        amount: bonus,
        balanceAfter: balanceAfterDeposit + bonus,
        periodId,
      });
    }

    let updated: SavingsRecord = { ...savings, currentAmount: balanceAfterDeposit + bonus };
    updated = await checkGoalCompletion(updated);

    set({ savings: updated });
    await persistSavings(updated);

    return {
      success: true,
      message:
        bonus > 0 ? `+${amount}⭐ в накопления (и бонус +${bonus}⭐)` : `+${amount}⭐ в накопления`,
    };
  },

  withdraw: async (amount) => {
    const { savings } = get();
    if (!savings) return { success: false, message: 'Накопления ещё не загружены' };
    if (amount <= 0) return { success: false, message: 'Введите сумму больше нуля' };
    if (savings.currentAmount < amount) {
      return { success: false, message: 'Недостаточно средств в накоплениях' };
    }

    const updated: SavingsRecord = {
      ...savings,
      currentAmount: savings.currentAmount - amount,
      periodsSinceWithdrawal: 0, // §11.5 — стрик удержания обнуляется при снятии
    };

    useUserStore.getState().recordTransaction(amount, 'savings_withdraw', 'Снятие из накоплений');

    await getSavingsRepository().addTransaction({
      savingsId: updated.id,
      operationType: 'withdraw',
      amount,
      balanceAfter: updated.currentAmount,
      periodId: currentPeriodId(),
    });

    set({ savings: updated });
    await persistSavings(updated);

    return { success: true, message: `−${amount}⭐ снято в кошелёк` };
  },

  registerPeriodOutcome: async () => {
    const { savings } = get();
    if (!savings) return;

    const newCount = savings.periodsSinceWithdrawal + 1;
    const updated: SavingsRecord = { ...savings, periodsSinceWithdrawal: newCount };

    if (newCount % HOLDING_STREAK_PERIODS === 0) {
      // §14.1: 3 периода без снятия -> гарантированный выбор 1 из 2
      useGiftsStore
        .getState()
        .addGuaranteedChoiceGift(
          'savings_hold',
          2,
          null,
          `Накопления: ${newCount} периода(ов) без снятия`
        );
    }

    set({ savings: updated });
    await persistSavings(updated);
  },

  reset: () => set({ savings: null, isLoading: true }),
}));
