// lib/stores/adventureStore.ts
// Жизненный цикл «Работы» (смены; в коде — adventure): planning -> active -> completed.
// Смена = один урок (решение пользователя 28.09.2026): при старте фиксируется
// урок — следующий непройденный урок выбранной темы. Смена длится до 24 часов
// и заканчивается, когда урок пройден (LessonPlayer вызывает completeAdventure)
// или время вышло (completeIfExpired) — тогда урок продолжится в следующую
// смену с того же места. Итоги показываются на хабе.
//
// Смена НЕ создаётся автоматически при заходе на хаб — только явным действием
// ребёнка (кнопка «Начать работу» / тап по ноутбуку), см. startPlanning().

import { getAdventureRepository } from '@/data/local/repositories';
import {
  AdventureAllocation,
  AdventureRecord,
  BudgetCategory,
  canAfford,
  computeAdventurePayout,
  isPlanBonusEligible,
  isTimeUp,
  totalAllocation,
} from '@/domain/adventure/Adventure';
import type { LessonEventOptionContent } from '@/domain/content/LessonContent';
import { planForLesson } from '@/domain/lesson/LessonPlan';
import {
  completedNodeCount,
  createLessonProgress,
  totalNodeCount,
} from '@/domain/lesson/lessonProgress';
import { xpToNextLevel } from '@/domain/player/PlayerLevel';
import {
  LESSONS,
  LevelUpResult,
  useLessonsStore,
  waitForLessonsLoaded,
} from '@/lib/hooks/useLessons';
import { create } from 'zustand';
import { useShopStore } from '@/lib/hooks/useShop';
import { usePreferencesStore } from './preferencesStore';
import { useSavingsStore } from './savingsStore';
import { useUserStore } from './userStore';
import { waitForHydration } from './waitForHydration';

/** Смена длится до 24 часов (решение пользователя 28.09.2026). */
export const ADVENTURE_DURATION_MS = 24 * 60 * 60 * 1000;
/** Доход смены — её стартовый бюджет (отдельный от хаба контур денег:
 * тратится только в событиях урока, остаток в конце уходит в хаб). */
export const ADVENTURE_BASE_INCOME = 100;
const PLAN_BONUS = 10; // монет в бюджет смены — «факт трат ≤ план»
/**
 * Опыт за завершение смены (§8.2). Этап 5 переносит опыт на уроки (закрытая
 * ветка — новый уровень); пока — прежнее правило.
 */
export const ADVENTURE_XP = 150;

/**
 * §2/§8 CLAUDE.md: «ошибка ребёнка не наказывается» — общее правило, штраф
 * за неверный ответ нигде в уроках/аркаде не применяется. Единственное
 * согласованное с пользователем исключение: пока урок идёт в смене (урок
 * смены, см. LessonPlayer), неверный ответ тратит немного энергии — вне
 * смены это же правило не действует.
 */
export const ADVENTURE_WRONG_ANSWER_ENERGY_COST = 5;

const EMPTY_ALLOCATION: AdventureAllocation = { mandatory: 0, optional: 0, savings: 0 };

/** Урок смены в итогах: сколько этапов пройдено к концу смены. */
export interface ShiftLessonSummary {
  id: number;
  title: string;
  nodesDone: number;
  nodesTotal: number;
  finished: boolean;
}

export interface AdventureCompletionSummary {
  adventure: AdventureRecord;
  /** Бонус за план — добавлен в бюджет смены перед выплатой. */
  bonusAwarded: number;
  /** Выплата остатка бюджета в хаб: «коплю» — в банк, остальное — в кошелёк. */
  toBank: number;
  /** Бонус банка на переведённое «коплю» (новые деньги, §11.4). */
  bankBonus: number;
  toWallet: number;
  /** Уже зачислен в useLessonsStore.totalXp — может дать level-up. */
  xpAwarded: number;
  levelUp: LevelUpResult | null;
  /** Доля пройденного урока смены: 1 — урок пройден (полная награда), меньше 1 — смена кончилась раньше. */
  completionRatio: number;
  /** true — смена закончилась сама, потому что 24 часа вышли (completeIfExpired). */
  autoCompleted: boolean;
  /** null — смена старой модели, без урока. */
  lesson: ShiftLessonSummary | null;
}

interface AdventureState {
  currentAdventure: AdventureRecord | null;
  isLoading: boolean;
  /** Итоги последней завершённой смены — показываются модалкой на хабе, пока их не закроют. */
  lastCompletionSummary: AdventureCompletionSummary | null;

  /** Загружает текущую незавершённую смену профиля, ничего не создавая. */
  loadCurrent: (profileId: string) => Promise<void>;
  /** Явно начинает планирование новой смены (если текущей ещё нет). */
  startPlanning: (profileId: string) => Promise<void>;
  /** Выбор темы — до подтверждения плана, только в памяти. */
  setBranch: (branchId: number) => void;
  /** Редактирование распределения будущего дохода — до подтверждения, только в памяти. */
  updatePlan: (plan: AdventureAllocation) => void;
  /**
   * Фиксирует план и урок смены (следующий непройденный урок темы), ставит
   * конец смены через 24 часа. false — нет темы, пустой план или в теме не
   * осталось непройденных уроков.
   */
  confirmPlan: () => Promise<boolean>;
  /** Прибавляет фактический расход/пополнение к направлению активной смены. */
  recordFact: (category: BudgetCategory, amount: number) => Promise<void>;
  /**
   * Выбор в событии урока (решение пользователя 28.09.2026: события — внутри
   * уроков, не по времени). Деньги — только бюджет смены: трата уменьшает его
   * и идёт в факт «нужно» / «хочу», пополнение — в бюджет. false — смена не
   * идёт или на платный вариант не хватает (§12.3).
   */
  applyLessonEventChoice: (eventId: string, option: LessonEventOptionContent) => Promise<boolean>;
  /**
   * Завершает смену: урок пройден (LessonPlayer) или ✕ раньше времени. Если
   * урок не пройден, награда пропорциональна пройденной доле урока — это не
   * штраф, а выбор ребёнка; урок продолжится в следующую смену.
   */
  completeAdventure: () => Promise<AdventureCompletionSummary | null>;
  /** 24 часа вышли — завершает смену (итоги — в lastCompletionSummary для показа на хабе). */
  completeIfExpired: () => Promise<AdventureCompletionSummary | null>;
  /** Модалку итогов на хабе закрыли. */
  dismissCompletionSummary: () => void;
  /** Тема активной смены — бейдж и подсветка на вкладке «Уроки». */
  isActiveBranch: (branchId: number) => boolean;
  /**
   * Урок идёт в смене — задание смены: события платит бюджет смены, ошибка
   * стоит энергии, урок пройден — смена завершается.
   */
  isShiftLesson: (lessonId: number, branchId: number) => boolean;
  reset: () => void;
}

/**
 * Завершение вызывается из нескольких мест (✕, конец урока, хаб по таймеру) и
 * асинхронно — без этого флага два почти одновременных вызова оба увидели бы
 * активную смену и начислили награды дважды.
 */
let completionInFlight = false;

async function withCompletionLock(
  run: () => Promise<AdventureCompletionSummary | null>
): Promise<AdventureCompletionSummary | null> {
  if (completionInFlight) return null;
  completionInFlight = true;
  try {
    return await run();
  } finally {
    completionInFlight = false;
  }
}

/** Сколько урока смены пройдено сейчас (для выплаты и итогов). */
function shiftLessonProgress(adventure: AdventureRecord): ShiftLessonSummary | null {
  if (adventure.lessonId === null) return null;
  const lesson = LESSONS.find((l) => l.id === adventure.lessonId);
  if (!lesson) return null;
  const isDemo = useUserStore.getState().user?.is_demo ?? false;
  const plan = planForLesson(lesson, isDemo);
  const state =
    useLessonsStore.getState().lessonStates[lesson.id] ?? createLessonProgress(lesson.id);
  return {
    id: lesson.id,
    title: lesson.title,
    nodesDone: completedNodeCount(plan, state),
    nodesTotal: totalNodeCount(plan),
    finished: Boolean(state.completedAt),
  };
}

export const useAdventureStore = create<AdventureState>((set, get) => {
  /** Общая часть ручного и автоматического завершения (вызывается под withCompletionLock). */
  const finalizeAdventure = async (
    autoCompleted: boolean
  ): Promise<AdventureCompletionSummary | null> => {
    const { currentAdventure } = get();
    if (!currentAdventure || currentAdventure.status !== 'active') return null;

    const completedAt = new Date().toISOString();
    const lesson = shiftLessonProgress(currentAdventure);
    // Доля награды — доля пройденного урока смены (урок пройден — полная).
    // Иначе «начал смену и дождался конца» приносило бы весь бюджет, ничего
    // не пройдя. Это не штраф: урок продолжится в следующую смену.
    // §18.2 демо-режим: завершение в любой момент — полная награда (иначе рост
    // уровня из обязательного сценария §19 п.10 за 1–2 минуты не увидеть).
    const isDemo = useUserStore.getState().user?.is_demo ?? false;
    const completionRatio =
      isDemo || !lesson || lesson.finished ? 1 : lesson.nodesDone / lesson.nodesTotal;
    const fullBonus = isPlanBonusEligible(currentAdventure) ? PLAN_BONUS : 0;
    const bonusAwarded = Math.floor(fullBonus * completionRatio);
    // §18 демо-режим (решение пользователя 28.09.2026): каждая демо-смена —
    // новый уровень (и новый облик на уровнях 2 и 3).
    const xpAwarded = isDemo
      ? Math.max(ADVENTURE_XP, xpToNextLevel(useLessonsStore.getState().totalXp))
      : Math.floor(ADVENTURE_XP * completionRatio);
    const { toBank, toWallet } = computeAdventurePayout(
      currentAdventure.budget + fullBonus,
      currentAdventure.plan.savings,
      completionRatio
    );
    // Бонус банка на «коплю» — только за пройденный урок.
    const bankBonusAllowed = completionRatio >= 1;

    try {
      await getAdventureRepository().complete(currentAdventure.id, completedAt, xpAwarded);
    } catch (error) {
      console.error('[AdventureStore] Не удалось завершить смену:', error);
      return null;
    }

    // Выплата в хаб: «коплю» — в банк (новые деньги, с бонусом банка), остальное
    // — в кошелёк. Если банк ещё не загружен — всё в кошелёк, чтобы монеты не пропали.
    let bankBonus = 0;
    let paidToBank = 0;
    let paidToWallet = toWallet;
    if (toBank > 0) {
      const deposited = await useSavingsStore
        .getState()
        .depositFromAdventure(toBank, bankBonusAllowed);
      if (deposited === null) {
        paidToWallet += toBank;
      } else {
        paidToBank = toBank;
        bankBonus = deposited;
      }
    }
    if (paidToWallet > 0) {
      useUserStore
        .getState()
        .recordTransaction(
          paidToWallet,
          'adventure_payout',
          `Итоги работы №${currentAdventure.adventureNumber}`
        );
    }
    try {
      const repo = getAdventureRepository();
      if (paidToBank > 0) await repo.addFact(currentAdventure.id, 'savings', paidToBank);
      await repo.setBudget(currentAdventure.id, 0);
    } catch (error) {
      console.warn('[AdventureStore] Не удалось сохранить выплату смены:', error);
    }
    // §11.5-аналог: стрик «без снятия» считается по каждому завершённому циклу дохода.
    try {
      await useSavingsStore.getState().registerPeriodOutcome();
    } catch (error) {
      console.warn('[AdventureStore] Не удалось обновить стрик накоплений:', error);
    }

    // Level up (и облик на уровнях 2/3, см. PlayerLevel.ts) считается
    // и награждается ровно в одном месте — useLessonsStore.addXp.
    const levelUp = useLessonsStore.getState().addXp(xpAwarded);

    const summary: AdventureCompletionSummary = {
      adventure: {
        ...currentAdventure,
        status: 'completed',
        completedAt,
        xpAwarded,
        budget: 0,
        fact: { ...currentAdventure.fact, savings: currentAdventure.fact.savings + paidToBank },
      },
      bonusAwarded,
      toBank: paidToBank,
      bankBonus,
      toWallet: paidToWallet,
      xpAwarded,
      levelUp,
      completionRatio,
      autoCompleted,
      lesson,
    };
    set({ currentAdventure: null, lastCompletionSummary: summary });

    return summary;
  };

  return {
    currentAdventure: null,
    isLoading: true,
    lastCompletionSummary: null,

    loadCurrent: async (profileId) => {
      set({ isLoading: true });
      try {
        const current = await getAdventureRepository().getCurrent(profileId);
        set({ currentAdventure: current, isLoading: false });
      } catch (error) {
        console.error('[AdventureStore] Не удалось загрузить смену:', error);
        set({ isLoading: false });
      }
    },

    startPlanning: async (profileId) => {
      set({ isLoading: true });
      try {
        const repo = getAdventureRepository();
        const existing = await repo.getCurrent(profileId);
        if (existing) {
          set({ currentAdventure: existing, isLoading: false });
          return;
        }

        const history = await repo.getHistory(profileId, 1);
        const adventureNumber = (history[0]?.adventureNumber ?? 0) + 1;

        const created = await repo.create({
          profileId,
          adventureNumber,
          status: 'planning',
          branchId: null,
          lessonId: null,
          projectedIncome: ADVENTURE_BASE_INCOME,
          budget: 0,
          plan: EMPTY_ALLOCATION,
          fact: EMPTY_ALLOCATION,
          startedAt: null,
          plannedEndAt: null,
          completedAt: null,
          xpAwarded: null,
        });

        set({ currentAdventure: created, isLoading: false });
      } catch (error) {
        console.error('[AdventureStore] Не удалось начать планирование смены:', error);
        set({ isLoading: false });
      }
    },

    setBranch: (branchId) => {
      const { currentAdventure } = get();
      if (!currentAdventure || currentAdventure.status !== 'planning') return;
      set({ currentAdventure: { ...currentAdventure, branchId } });
    },

    updatePlan: (plan) => {
      const { currentAdventure } = get();
      if (!currentAdventure || currentAdventure.status !== 'planning') return;
      set({ currentAdventure: { ...currentAdventure, plan } });
    },

    confirmPlan: async () => {
      const { currentAdventure } = get();
      if (!currentAdventure || currentAdventure.status !== 'planning') return false;
      if (currentAdventure.branchId === null) return false;
      if (totalAllocation(currentAdventure.plan) <= 0) return false;
      // Урок смены — следующий непройденный урок темы (начатый продолжится с
      // того же места: прогресс урока хранится отдельно от смены).
      const lesson = useLessonsStore.getState().getNextLessonInBranch(currentAdventure.branchId);
      if (!lesson) return false;

      const startedAt = new Date();
      const plannedEndAt = new Date(startedAt.getTime() + ADVENTURE_DURATION_MS);

      await getAdventureRepository().setPlan(
        currentAdventure.id,
        currentAdventure.branchId,
        currentAdventure.plan
      );
      // Доход смены — её собственный бюджет (не кошелёк хаба): план
      // распределяет ИМЕННО эту сумму на «потратить» и «коплю», тратят её
      // события урока, остаток в конце уходит в хаб (см. finalizeAdventure).
      const budget = currentAdventure.projectedIncome;
      await getAdventureRepository().activate(
        currentAdventure.id,
        startedAt.toISOString(),
        plannedEndAt.toISOString(),
        budget,
        lesson.id
      );

      set({
        currentAdventure: {
          ...currentAdventure,
          status: 'active',
          lessonId: lesson.id,
          budget,
          startedAt: startedAt.toISOString(),
          plannedEndAt: plannedEndAt.toISOString(),
        },
      });
      return true;
    },

    recordFact: async (category, amount) => {
      const { currentAdventure } = get();
      if (!currentAdventure || currentAdventure.status !== 'active') return;

      const fact = {
        ...currentAdventure.fact,
        [category]: currentAdventure.fact[category] + amount,
      };
      set({ currentAdventure: { ...currentAdventure, fact } });

      try {
        await getAdventureRepository().addFact(currentAdventure.id, category, amount);
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить факт смены:', error);
      }
    },

    applyLessonEventChoice: async (eventId, option) => {
      const adventure = get().currentAdventure;
      if (!adventure || adventure.status !== 'active') return false;
      if (!canAfford(option.coinAmount, adventure.budget)) return false;

      let budget = adventure.budget;
      if (option.coinAmount < 0 && option.category) {
        const cost = -option.coinAmount;
        budget -= cost;
        await get().recordFact(option.category, cost);
      } else if (option.coinAmount > 0) {
        budget += option.coinAmount;
      }

      // recordFact уже обновил currentAdventure — перечитываем, чтобы не затереть факт.
      const latest = get().currentAdventure;
      if (!latest) return false;
      set({ currentAdventure: { ...latest, budget } });

      try {
        const repo = getAdventureRepository();
        await repo.setBudget(latest.id, budget);
        await repo.logEvent(
          latest.id,
          eventId,
          option.id,
          option.category,
          option.coinAmount,
          0,
          new Date().toISOString()
        );
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить выбор в событии урока:', error);
      }
      return true;
    },

    completeAdventure: () => withCompletionLock(() => finalizeAdventure(false)),

    completeIfExpired: () =>
      withCompletionLock(async () => {
        const adventure = get().currentAdventure;
        if (!adventure || !isTimeUp(adventure, Date.now())) return null;

        // На холодном старте (приложение открыли спустя часы) прогресс уроков и
        // опыт ещё может читаться из SQLite, а инвентарь — восстанавливаться из
        // AsyncStorage: начисление до конца загрузки было бы затёрто.
        await Promise.all([
          waitForLessonsLoaded(),
          waitForHydration(useShopStore),
          waitForHydration(usePreferencesStore),
        ]);

        const latest = get().currentAdventure;
        if (!latest || latest.id !== adventure.id || latest.status !== 'active') return null;
        return finalizeAdventure(true);
      }),

    dismissCompletionSummary: () => set({ lastCompletionSummary: null }),

    isActiveBranch: (branchId) => {
      const { currentAdventure } = get();
      return (
        !!currentAdventure &&
        currentAdventure.status === 'active' &&
        currentAdventure.branchId === branchId
      );
    },

    isShiftLesson: (lessonId, branchId) => {
      const { currentAdventure } = get();
      if (!currentAdventure || currentAdventure.status !== 'active') return false;
      // Смена старой модели (без урока) — урок её темы.
      return currentAdventure.lessonId === null
        ? currentAdventure.branchId === branchId
        : currentAdventure.lessonId === lessonId;
    },

    reset: () =>
      set({
        currentAdventure: null,
        isLoading: true,
        lastCompletionSummary: null,
      }),
  };
});
