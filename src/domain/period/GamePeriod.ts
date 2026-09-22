// domain/period/GamePeriod.ts
// Игровой период (§7 ТЗ): завершённый цикл финансовых решений, не привязанный
// к календарному времени — ребёнок сам завершает период кнопкой «Завершить период».

export type BudgetCategory = 'mandatory' | 'optional' | 'savings';

export interface PeriodAllocation {
  mandatory: number;
  optional: number;
  savings: number;
}

export type GamePeriodStatus = 'planning' | 'active' | 'completed';

export interface GamePeriodRecord {
  id: number;
  profileId: string;
  periodNumber: number;
  status: GamePeriodStatus;
  incomeAwarded: number;
  plan: PeriodAllocation;
  fact: PeriodAllocation;
  startedAt: string;
  endedAt: string | null;
}

export function totalAllocation(allocation: PeriodAllocation): number {
  return allocation.mandatory + allocation.optional + allocation.savings;
}

/** §5 «Бонус за план +10⭐ — факт ≤ план за период»: накопления не в счёт, это не расход. */
export function isPlanBonusEligible(period: GamePeriodRecord): boolean {
  const factSpent = period.fact.mandatory + period.fact.optional;
  const plannedSpent = period.plan.mandatory + period.plan.optional;
  return factSpent <= plannedSpent;
}
