// domain/savings/Savings.ts
// Накопления и финансовая цель (§11 ТЗ). Заменяет старую модель «Вклад» —
// это не имитация банковского вклада: бонус фиксированный и не растёт со
// временем, начисляется только при взаимодействии (§11.1, §11.4).

export const BASE_SAVINGS_BONUS_RATE = 1; // §11.4 «фиксированное небольшое значение»
export const GOAL_COMPLETION_BONUS_PERCENT = 10; // §11.5 «+10% цены предмета»

/** §11.5: награда монетами за достигнутую цель — 10% цены, целым числом. */
export function goalCompletionBonus(targetPrice: number): number {
  return Math.floor((targetPrice * GOAL_COMPLETION_BONUS_PERCENT) / 100);
}

export type SavingsOperationType = 'deposit' | 'withdraw' | 'bonus' | 'reward';

export interface SavingsRecord {
  id: number;
  profileId: string;
  currentAmount: number;
  bonusRate: number;
  targetItemId: number | null;
  periodsSinceWithdrawal: number;
  /** Сколько монет снято из банка и ещё не возвращено — на их возврат бонус не
   * начисляется (см. computeDepositBonus). */
  withdrawalCredit: number;
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

/**
 * §11.4: бонус только за НОВЫЕ деньги. Пополнение сначала «гасит» ранее снятое
 * (withdrawalCredit) — возврат своих же монет бонуса не даёт; на остаток —
 * bonus = floor(new × bonus_rate / 100). Раньше бонус считался от всей суммы
 * накоплений при каждом пополнении: пополнения по 1 монете (или «снял —
 * положил обратно») давали бесконечный доход.
 */
export function computeDepositBonus(
  depositAmount: number,
  withdrawalCredit: number,
  bonusRate: number
): { bonus: number; creditLeft: number } {
  const returned = Math.min(depositAmount, withdrawalCredit);
  const newMoney = depositAmount - returned;
  return {
    bonus: Math.floor((newMoney * bonusRate) / 100),
    creditLeft: withdrawalCredit - returned,
  };
}
