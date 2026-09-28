// domain/repositories/AdventureRepository.ts

import { AdventureAllocation, AdventureRecord, BudgetCategory } from '@/domain/adventure/Adventure';

export interface AdventureRepository {
  getCurrent(profileId: string): Promise<AdventureRecord | null>;
  getHistory(profileId: string, limit?: number): Promise<AdventureRecord[]>;
  create(record: Omit<AdventureRecord, 'id'>): Promise<AdventureRecord>;
  /** Фиксирует ветку и план (§ этап планирования) — до этого статус остаётся 'planning'. */
  setPlan(id: number, branchId: number, plan: AdventureAllocation): Promise<void>;
  /** planning -> active: момент старта, конец смены, стартовый бюджет и урок смены. */
  activate(
    id: number,
    startedAt: string,
    plannedEndAt: string,
    budget: number,
    lessonId: number
  ): Promise<void>;
  /** Новый остаток бюджета смены (после трат/пополнений событий, выплаты в хаб). */
  setBudget(id: number, budget: number): Promise<void>;
  /** Прибавляет amount к fact[category] — при каждом реальном расходе/пополнении во время смены. */
  addFact(id: number, category: BudgetCategory, amount: number): Promise<void>;
  /** Журнал решённых событий урока — для статистики «Решений принято». */
  logEvent(
    adventureId: number,
    templateId: string,
    optionId: string,
    category: BudgetCategory | null,
    coinAmount: number,
    timeDeltaMs: number,
    resolvedAt: string
  ): Promise<void>;
  /** Сколько событий ребёнок решил сам за всё время (без снятых по истечении времени) — «Решений принято». */
  countResolvedEvents(profileId: string): Promise<number>;
  complete(id: number, completedAt: string, xpAwarded: number): Promise<void>;
  /**
   * Итоги завершённой смены, ещё не показанные ребёнку (JSON от
   * adventureStore); null — окно итогов закрыто.
   */
  setPendingSummary(id: number, summaryJson: string | null): Promise<void>;
  /** Последняя завершённая смена профиля с непоказанными итогами. */
  getPendingSummary(
    profileId: string
  ): Promise<{ adventure: AdventureRecord; summaryJson: string } | null>;
  /** §17.2 «Сброс профиля» — следующая смена снова начнётся с №1. */
  deleteAllForProfile(profileId: string): Promise<void>;
}
