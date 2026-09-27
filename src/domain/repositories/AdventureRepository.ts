// domain/repositories/AdventureRepository.ts

import { AdventureAllocation, AdventureRecord, BudgetCategory } from '@/domain/adventure/Adventure';

export interface AdventureRepository {
  getCurrent(profileId: string): Promise<AdventureRecord | null>;
  getHistory(profileId: string, limit?: number): Promise<AdventureRecord[]>;
  create(record: Omit<AdventureRecord, 'id'>): Promise<AdventureRecord>;
  /** Фиксирует ветку и план (§ этап планирования) — до этого статус остаётся 'planning'. */
  setPlan(id: number, branchId: number, plan: AdventureAllocation): Promise<void>;
  /** planning -> active: фиксирует момент старта, плановое время окончания, первую проверку события и стартовый бюджет. */
  activate(
    id: number,
    startedAt: string,
    plannedEndAt: string,
    nextEventCheckAt: string,
    budget: number
  ): Promise<void>;
  /** Новый остаток бюджета приключения (после трат/наград событий, выплаты в хаб). */
  setBudget(id: number, budget: number): Promise<void>;
  /** Прибавляет amount к fact[category] — при каждом реальном расходе/пополнении во время приключения. */
  addFact(id: number, category: BudgetCategory, amount: number): Promise<void>;
  /** Двигает плановое время окончания и запоминает суммарную коррекцию (задания/события). */
  adjustTime(id: number, plannedEndAt: string, timeAdjustmentMs: number): Promise<void>;
  incrementQuestsCompleted(id: number): Promise<void>;
  /** Фиксирует новое неразрешённое событие — блокирует complete() до resolveEvent(). */
  rollEvent(id: number, templateId: string, rolledAt: string): Promise<void>;
  /** Снимает неразрешённое событие и запоминает время следующей проверки (~через час). */
  resolveEvent(id: number, nextEventCheckAt: string): Promise<void>;
  /** Аудит уже решённых событий — для сводки по завершении приключения. */
  logEvent(
    adventureId: number,
    templateId: string,
    optionId: string,
    category: BudgetCategory | null,
    coinAmount: number,
    timeDeltaMs: number,
    resolvedAt: string
  ): Promise<void>;
  /** Id шаблонов уже выпадавших в приключении событий (включая истёкшие) — для лимита и выбора без повторов. */
  getEventTemplateIds(adventureId: number): Promise<string[]>;
  /** Сколько событий ребёнок решил сам за всё время (без снятых по истечении времени) — «Решений принято». */
  countResolvedEvents(profileId: string): Promise<number>;
  complete(id: number, completedAt: string, xpAwarded: number): Promise<void>;
  /** §17.2 «Сброс профиля» — следующее приключение снова начнётся с №1. */
  deleteAllForProfile(profileId: string): Promise<void>;
}
