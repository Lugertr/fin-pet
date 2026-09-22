// lib/stores/periodStore.ts
// Жизненный цикл игрового периода (§7 ТЗ): planning -> active -> completed -> следующий период.

import { getPeriodRepository } from '@/data/local/repositories';
import {
  BudgetCategory,
  GamePeriodRecord,
  PeriodAllocation,
  isPlanBonusEligible,
} from '@/domain/period/GamePeriod';
import { isPeriodSuccessful } from '@/domain/pet/PetProgress';
import { create } from 'zustand';
import { StageUpResult, usePetProgressStore } from './petProgressStore';
import { usePetStore } from './petStore';
import { useSavingsStore } from './savingsStore';
import { useUserStore } from './userStore';

const PERIOD_START_INCOME = 20; // §5 «Бонус за начало периода»
const PLAN_BONUS = 10; // §5 «Бонус за план — факт ≤ план за период»

export interface PeriodCompletionSummary {
  period: GamePeriodRecord;
  bonusAwarded: number;
  /** §8.2: энергия ≥30 на момент завершения И было пополнение накоплений в периоде. */
  wasSuccessful: boolean;
  stageUp: StageUpResult | null;
}

const EMPTY_ALLOCATION: PeriodAllocation = { mandatory: 0, optional: 0, savings: 0 };

interface PeriodState {
  currentPeriod: GamePeriodRecord | null;
  isLoading: boolean;

  /** Загружает текущий незавершённый период профиля или создаёт новый (+20⭐ дохода). */
  loadOrStartPeriod: (profileId: string) => Promise<void>;
  /** Редактирование плана до подтверждения (§7.3) — пока только в памяти. */
  updatePlan: (plan: PeriodAllocation) => void;
  /** Фиксирует план в SQLite и переводит период в статус active. */
  confirmPlan: () => Promise<void>;
  /** Прибавляет фактический расход/пополнение к направлению периода. */
  recordFact: (category: BudgetCategory, amount: number) => Promise<void>;
  /** Завершает период, начисляет бонус за план, возвращает сводку для экрана. */
  completePeriod: () => Promise<PeriodCompletionSummary | null>;
  reset: () => void;
}

export const usePeriodStore = create<PeriodState>((set, get) => ({
  currentPeriod: null,
  isLoading: true,

  loadOrStartPeriod: async (profileId) => {
    set({ isLoading: true });
    try {
      const repo = getPeriodRepository();
      let period = await repo.getCurrent(profileId);

      if (!period) {
        const history = await repo.getHistory(profileId, 1);
        const periodNumber = (history[0]?.periodNumber ?? 0) + 1;
        const startedAt = new Date().toISOString();

        period = await repo.create({
          profileId,
          periodNumber,
          status: 'planning',
          incomeAwarded: PERIOD_START_INCOME,
          plan: EMPTY_ALLOCATION,
          fact: EMPTY_ALLOCATION,
          startedAt,
          endedAt: null,
        });

        useUserStore
          .getState()
          .recordTransaction(
            PERIOD_START_INCOME,
            'period_income',
            `Доход периода №${periodNumber}`
          );
      }

      set({ currentPeriod: period, isLoading: false });
    } catch (error) {
      console.error('[PeriodStore] Не удалось загрузить/создать период:', error);
      set({ isLoading: false });
    }
  },

  updatePlan: (plan) => {
    const { currentPeriod } = get();
    if (!currentPeriod || currentPeriod.status !== 'planning') return;
    set({ currentPeriod: { ...currentPeriod, plan } });
  },

  confirmPlan: async () => {
    const { currentPeriod } = get();
    if (!currentPeriod || currentPeriod.status !== 'planning') return;

    await getPeriodRepository().setPlan(currentPeriod.id, currentPeriod.plan);
    await getPeriodRepository().activate(currentPeriod.id);

    set({ currentPeriod: { ...currentPeriod, status: 'active' } });
  },

  recordFact: async (category, amount) => {
    const { currentPeriod } = get();
    if (!currentPeriod) return;

    const fact = { ...currentPeriod.fact, [category]: currentPeriod.fact[category] + amount };
    set({ currentPeriod: { ...currentPeriod, fact } });

    try {
      await getPeriodRepository().addFact(currentPeriod.id, category, amount);
    } catch (error) {
      console.warn('[PeriodStore] Не удалось сохранить факт периода:', error);
    }
  },

  completePeriod: async () => {
    const { currentPeriod } = get();
    if (!currentPeriod) return null;

    const endedAt = new Date().toISOString();
    const bonusAwarded = isPlanBonusEligible(currentPeriod) ? PLAN_BONUS : 0;

    await getPeriodRepository().complete(currentPeriod.id, endedAt);

    if (bonusAwarded > 0) {
      useUserStore
        .getState()
        .recordTransaction(bonusAwarded, 'period_plan_bonus', 'Факт ≤ план периода');
    }

    const completed: GamePeriodRecord = { ...currentPeriod, status: 'completed', endedAt };
    set({ currentPeriod: null });

    // §8.2: энергия должна быть актуальной на момент завершения, а не
    // закэшированным значением с последнего refreshMood() (например, на хабе)
    usePetStore.getState().refreshMood();
    const currentEnergy = usePetStore.getState().currentMood;
    const wasSuccessful = isPeriodSuccessful(currentEnergy, completed.fact.savings);
    const stageUp = wasSuccessful
      ? await usePetProgressStore.getState().registerSuccessfulPeriod()
      : null;

    // §11.5: стрик «периодов без снятия» считается по каждому завершённому периоду
    await useSavingsStore.getState().registerPeriodOutcome();

    return { period: completed, bonusAwarded, wasSuccessful, stageUp };
  },

  reset: () => set({ currentPeriod: null, isLoading: true }),
}));
