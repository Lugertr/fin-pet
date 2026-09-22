// domain/savings/Savings.ts
// Накопления и финансовая цель (§11 ТЗ). Заменяет старую модель «Вклад» —
// это не имитация банковского вклада: бонус фиксированный и не растёт со
// временем, начисляется только при взаимодействии (§11.1, §11.4).

export const BASE_SAVINGS_BONUS_RATE = 1; // §11.4 «фиксированное небольшое значение»
export const GOAL_COMPLETION_BONUS_PERCENT = 10; // §11.5 «+10% цены предмета»
export const HOLDING_STREAK_PERIODS = 3; // §11.5 «3 периода без снятия»

export type SavingsOperationType = 'deposit' | 'withdraw' | 'bonus' | 'reward';

export interface SavingsRecord {
  id: number;
  profileId: string;
  currentAmount: number;
  bonusRate: number;
  targetItemId: number | null;
  periodsSinceWithdrawal: number;
}

export interface SavingsTransactionRecord {
  id: number;
  savingsId: number;
  operationType: SavingsOperationType;
  amount: number;
  balanceAfter: number;
  periodId: number | null;
  createdAt: string;
}

/** §11.4: bonus = floor(current_amount * bonus_rate / 100), считается на новую сумму при взаимодействии. */
export function computeInteractionBonus(amountAfterDeposit: number, bonusRate: number): number {
  return Math.floor((amountAfterDeposit * bonusRate) / 100);
}
