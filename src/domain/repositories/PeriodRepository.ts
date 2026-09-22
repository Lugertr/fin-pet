// domain/repositories/PeriodRepository.ts

import { BudgetCategory, GamePeriodRecord, PeriodAllocation } from '@/domain/period/GamePeriod';

export interface PeriodRepository {
  getCurrent(profileId: string): Promise<GamePeriodRecord | null>;
  getHistory(profileId: string, limit?: number): Promise<GamePeriodRecord[]>;
  create(record: Omit<GamePeriodRecord, 'id'>): Promise<GamePeriodRecord>;
  setPlan(id: number, plan: PeriodAllocation): Promise<void>;
  /** Прибавляет amount к fact[category] — вызывается при каждом реальном расходе/пополнении. */
  addFact(id: number, category: BudgetCategory, amount: number): Promise<void>;
  activate(id: number): Promise<void>;
  complete(id: number, endedAt: string): Promise<void>;
  /** §17.2 «Сброс профиля» — следующий период снова начнётся с №1. */
  deleteAllForProfile(profileId: string): Promise<void>;
}
