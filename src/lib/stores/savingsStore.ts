// lib/stores/savingsStore.ts
// Накопления и финансовая цель (§11 ТЗ) — заменяет старую модель «Вклад».

import { getSavingsRepository } from '@/data/local/repositories';
import {
  BASE_SAVINGS_BONUS_RATE,
  SavingsRecord,
  computeDepositBonus,
  goalCompletionBonus,
} from '@/domain/savings/Savings';
import { create } from 'zustand';
import { SHOP_CATALOG, useShopStore } from '../hooks/useShop';
import { useAchievementsStore } from './achievementsStore';
import { useAdventureStore } from './adventureStore';
import { formatPrice } from '../utils/formatters';
import { isSavingsGoalItem } from '../utils/itemCategories';
import { useUserStore } from './userStore';

interface SavingsActionResult {
  success: boolean;
  message: string;
}

interface SavingsState {
  savings: SavingsRecord | null;
  isLoading: boolean;
  /**
   * Цель, достигнутая в этой сессии, — её поздравляет окно выбора новой цели
   * (RequiredGoalPicker). Только в памяти: после перезапуска окно просто
   * просит выбрать цель, без поздравления.
   */
  lastCompletedGoalId: number | null;

  loadOrCreate: (profileId: string) => Promise<void>;
  /** Цель — только ещё не купленное улучшение (isSavingsGoalItem). Если на неё
   * уже накоплено, она покупается сразу (§11.3), а не при следующем пополнении. */
  setTarget: (itemId: number | null) => Promise<void>;
  /** Поздравление показано — окно выбора цели больше его не повторяет. */
  clearCompletedGoal: () => void;
  /** Переводит монеты из кошелька в накопления и сразу начисляет бонус за новые деньги (§11.4). */
  deposit: (amount: number) => Promise<SavingsActionResult>;
  /**
   * «Коплю» из бюджета завершённого приключения — в банк (не из кошелька).
   * Это новые деньги: бонус начисляется на всю сумму. Возвращает бонус или
   * null, если банк ещё не загружен (тогда вызывающий кладёт деньги в кошелёк,
   * чтобы они не пропали).
   */
  depositFromAdventure: (amount: number, withBonus?: boolean) => Promise<number | null>;
  /** Возвращает монеты из накоплений в кошелёк, обнуляет стрик удержания (§11.5). */
  withdraw: (amount: number) => Promise<SavingsActionResult>;
  /** Вызывается adventureStore при завершении приключения — считает стрик «без снятия» (§11.5). */
  registerPeriodOutcome: () => Promise<void>;
  reset: () => void;
}

async function persistSavings(record: SavingsRecord): Promise<void> {
  await getSavingsRepository().update(record);
}

/** Историческое имя поля в savings_transactions (period_id) — теперь пишет id
 * текущего приключения, а не периода (полностью замещённого приключением). */
function currentPeriodId(): number | null {
  return useAdventureStore.getState().currentAdventure?.id ?? null;
}

/** §11.3: накоплено ≥ цены цели → покупка → предмет в инвентаре и +10% цены (подарка нет — только за 7 дней подряд). */
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
  useSavingsStore.setState({ lastCompletedGoalId: targetItem.id });

  const bonusCoins = goalCompletionBonus(targetItem.price);
  useUserStore
    .getState()
    .recordTransaction(bonusCoins, 'savings_goal_reward', `Цель достигнута: ${targetItem.name}`);

  await getSavingsRepository().addTransaction({
    savingsId: updated.id,
    operationType: 'reward',
    amount: -targetItem.price,
    balanceAfter: updated.currentAmount,
    periodId: currentPeriodId(),
  });

  return updated;
}

/**
 * Общая часть пополнения банка: бонус (§11.4) только за новые деньги, запись
 * операций, достижение «Первая копилка», проверка цели. fromWallet — деньги из
 * кошелька (гасят ранее снятое, см. computeDepositBonus); иначе — «коплю» из
 * приключения, это новые деньги целиком. Банк хаба — отдельный контур от
 * бюджета приключения, поэтому в факт приключения пополнение не пишется.
 */
async function applyDeposit(
  savings: SavingsRecord,
  amount: number,
  fromWallet: boolean,
  withBonus = true
): Promise<number> {
  // withBonus=false — «коплю» досрочно завершённого приключения: без бонуса банка.
  const effectiveBonusRate = withBonus
    ? BASE_SAVINGS_BONUS_RATE + useShopStore.getState().getSavingsBonusRateBonus()
    : 0;
  const { bonus, creditLeft } = computeDepositBonus(
    amount,
    fromWallet ? savings.withdrawalCredit : 0,
    effectiveBonusRate
  );
  const balanceAfterDeposit = savings.currentAmount + amount;

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

  let updated: SavingsRecord = {
    ...savings,
    currentAmount: balanceAfterDeposit + bonus,
    withdrawalCredit: fromWallet ? creditLeft : savings.withdrawalCredit,
  };
  updated = await checkGoalCompletion(updated);

  useSavingsStore.setState({ savings: updated });
  await persistSavings(updated);
  return bonus;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  savings: null,
  isLoading: true,
  lastCompletedGoalId: null,

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
    // Цель — только улучшение ноутбука, копилки или кровати (решение
    // пользователя 27.09.2026): облик питомца, трофей, стартовую вещь, еду и
    // декор накоплением не получить (checkGoalCompletion выдал бы их).
    if (itemId !== null) {
      const item = SHOP_CATALOG.find((i) => i.id === itemId);
      if (!item || !isSavingsGoalItem(item)) return;
      // Уже купленную вещь копить незачем — checkGoalCompletion выдал бы её второй раз.
      if ((useShopStore.getState().ownedItems[itemId] ?? 0) > 0) return;
    }

    // §11.3: накоплено ≥ цены → покупка. После достигнутой цели в банке может
    // остаться больше цены следующей — тогда она покупается сразу.
    const updated = await checkGoalCompletion({ ...savings, targetItemId: itemId });
    set({ savings: updated });
    await persistSavings(updated);
  },

  clearCompletedGoal: () => set({ lastCompletedGoalId: null }),

  deposit: async (amount) => {
    const { savings } = get();
    if (!savings) return { success: false, message: 'Накопления ещё не загружены' };
    if (amount <= 0) return { success: false, message: 'Впиши сумму больше нуля' };

    const { user } = useUserStore.getState();
    if (!user || user.liquid_balance < amount) {
      return { success: false, message: 'Недостаточно монет в кошельке' };
    }

    if (
      !useUserStore.getState().recordTransaction(-amount, 'savings_deposit', 'Перевод в накопления')
    ) {
      return { success: false, message: 'Недостаточно монет в кошельке' };
    }
    const bonus = await applyDeposit(savings, amount, true);

    return {
      success: true,
      message:
        bonus > 0
          ? `+${formatPrice(amount)} в накопления (и бонус +${formatPrice(bonus)})`
          : `+${formatPrice(amount)} в накопления`,
    };
  },

  depositFromAdventure: async (amount, withBonus = true) => {
    const { savings } = get();
    if (!savings) return null;
    if (amount <= 0) return 0;
    return applyDeposit(savings, amount, false, withBonus);
  },

  withdraw: async (amount) => {
    const { savings } = get();
    if (!savings) return { success: false, message: 'Накопления ещё не загружены' };
    if (amount <= 0) return { success: false, message: 'Впиши сумму больше нуля' };
    if (savings.currentAmount < amount) {
      return { success: false, message: 'Недостаточно средств в накоплениях' };
    }

    const updated: SavingsRecord = {
      ...savings,
      currentAmount: savings.currentAmount - amount,
      periodsSinceWithdrawal: 0, // §11.5 — стрик удержания обнуляется при снятии
      // Снятое помним: когда эти монеты вернутся в банк, бонус за них не
      // начисляется (computeDepositBonus) — иначе «снял — положил» фармил бонус.
      withdrawalCredit: savings.withdrawalCredit + amount,
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

    return { success: true, message: `−${formatPrice(amount)} снято в кошелёк` };
  },

  registerPeriodOutcome: async () => {
    const { savings } = get();
    if (!savings) return;

    const newCount = savings.periodsSinceWithdrawal + 1;
    const updated: SavingsRecord = { ...savings, periodsSinceWithdrawal: newCount };

    set({ savings: updated });
    await persistSavings(updated);
  },

  reset: () => set({ savings: null, isLoading: true, lastCompletedGoalId: null }),
}));
