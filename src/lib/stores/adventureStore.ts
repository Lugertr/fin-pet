// lib/stores/adventureStore.ts
// Жизненный цикл «Приключения»: planning -> active -> completed.
// Полностью заменяет periodStore.ts — план/факт/бонус за план те же по духу
// (§7 ТЗ), но приключение привязано к выбранной ветке обучения и реальному
// времени (8 часов), а не к ручной кнопке «Завершить период».
//
// Важно: в отличие от периода, приключение НЕ создаётся автоматически при
// заходе на хаб — только явным действием ребёнка (тап по ноутбуку/кнопка
// «Начать приключение»), см. startPlanning(). А вот завершается оно автоматически,
// когда время вышло (см. completeIfExpired) — итоги показываются на хабе.

import { getLocalContentRepository } from '@/data/content';
import { getAdventureRepository } from '@/data/local/repositories';
import {
  AdventureAllocation,
  AdventureRecord,
  BudgetCategory,
  adventureProgressRatio,
  computeAdventurePayout,
  applyTimeAdjustment,
  isPlanBonusEligible,
  isTimeUp,
  totalAllocation,
} from '@/domain/adventure/Adventure';
import {
  EVENT_PACING,
  EventTrigger,
  isEventDue,
  isOptionAffordable,
  pickRandomEventTemplate,
  selectEventPool,
} from '@/domain/adventure/AdventureEvent';
import { LevelUpResult, useLessonsStore } from '@/lib/hooks/useLessons';
import { create } from 'zustand';
import { useShopStore } from '@/lib/hooks/useShop';
import { usePetStore } from './petStore';
import { usePreferencesStore } from './preferencesStore';
import { useSavingsStore } from './savingsStore';
import { useUserStore } from './userStore';
import { waitForHydration } from './waitForHydration';

export const ADVENTURE_DURATION_MS = 8 * 60 * 60 * 1000; // 8 реальных часов
/** Доход приключения — стартовый бюджет приключения (отдельный от хаба контур
 * денег: тратится только на события, остаток в конце уходит в хаб). */
export const ADVENTURE_BASE_INCOME = 100;
const PLAN_BONUS = 10; // монет в бюджет приключения — «факт трат ≤ план»
export const QUEST_TIME_BONUS_MS = 45 * 60 * 1000; // -45 мин таймера за пройденное задание-урок
const MIN_REMAINING_MS = 15 * 60 * 1000; // таймер не обнуляется мгновенно от заданий/событий
/**
 * Опыт — только за завершение приключения (решение пользователя 27.09.2026:
 * уроки и задания опыта не дают). 150 — уровень 2 после 2 приключений,
 * уровень 3 — ровно после 5 (§8.3/§20: «уровень 3 в пределах 5 демо-приключений»).
 */
export const ADVENTURE_XP = 150;
/** option_id в журнале событий для события, которое так и не решили до конца приключения. */
const EXPIRED_EVENT_OPTION_ID = 'expired';

/**
 * §2/§8 CLAUDE.md: «ошибка ребёнка не наказывается» — общее правило, штраф
 * за неверный ответ нигде в уроках/аркаде не применяется. Единственное
 * согласованное с пользователем исключение: пока урок засчитывается как
 * задание активного приключения (см. StepRunner.tsx), неверный ответ тратит
 * немного энергии — вне приключения это же правило не действует.
 */
export const ADVENTURE_WRONG_ANSWER_ENERGY_COST = 5;

const EMPTY_ALLOCATION: AdventureAllocation = { mandatory: 0, optional: 0, savings: 0 };

export interface AdventureCompletionSummary {
  adventure: AdventureRecord;
  /** Бонус за план — добавлен в бюджет приключения перед выплатой. */
  bonusAwarded: number;
  /** Выплата остатка бюджета в хаб: «коплю» — в банк, остальное — в кошелёк. */
  toBank: number;
  /** Бонус банка на переведённое «коплю» (новые деньги, §11.4). */
  bankBonus: number;
  toWallet: number;
  /** Уже зачислен в useLessonsStore.totalXp (см. completeAdventure ниже) — может дать level-up. */
  xpAwarded: number;
  levelUp: LevelUpResult | null;
  /** 1 — приключение завершено по истечении времени (полная награда); меньше 1 — завершено досрочно. */
  completionRatio: number;
  /** true — завершено само, потому что время вышло (см. completeIfExpired), а не кнопкой. */
  autoCompleted: boolean;
}

interface AdventureState {
  currentAdventure: AdventureRecord | null;
  isLoading: boolean;
  /** Шаблоны событий, уже выпадавших в текущем приключении (из adventure_event_log) — лимит и выбор без повторов. */
  usedEventTemplateIds: string[];
  /** Итоги последнего завершённого приключения — показываются модалкой на хабе, пока их не закроют. */
  lastCompletionSummary: AdventureCompletionSummary | null;

  /** Загружает текущее незавершённое приключение профиля, ничего не создавая. */
  loadCurrent: (profileId: string) => Promise<void>;
  /** Явно начинает планирование нового приключения (если текущего ещё нет). */
  startPlanning: (profileId: string) => Promise<void>;
  /** Выбор компетенции — до подтверждения плана, только в памяти. */
  setBranch: (branchId: number) => void;
  /** Редактирование распределения будущего дохода — до подтверждения, только в памяти. */
  updatePlan: (plan: AdventureAllocation) => void;
  /** Требует выбранную ветку и total > 0. Фиксирует план в SQLite, переводит в active, ставит таймер. */
  confirmPlan: () => Promise<void>;
  /** Прибавляет фактический расход/пополнение к направлению активного приключения. */
  recordFact: (category: BudgetCategory, amount: number) => Promise<void>;
  /** Пройдено задание-урок/тренажёр по ветке приключения: ускоряет таймер, увеличивает счётчик. */
  registerQuestCompletion: () => Promise<void>;
  /**
   * Раунд Аркады по теме приключения (тренировка, не задание): ускоряет таймер
   * на minutes (до 15, см. arcadeTimeBonusMinutes) — слабее урока-задания (45).
   * Счётчик заданий не растёт. Возвращает, на сколько минут реально ускорено.
   */
  registerArcadeRound: (minutes: number) => Promise<number>;
  /**
   * Если подошло время и нет уже неразрешённого события — рождает новое.
   * 'entry' (ребёнок зашёл на экран приключения) может сработать раньше
   * обычного часового срока — см. EVENT_PACING/isEventDue.
   */
  checkForDueEvent: (trigger: EventTrigger) => Promise<void>;
  /**
   * Применяет выбранный вариант события: деньги (если есть) + коррекция
   * времени, снимает блокировку завершения. Недоступный по деньгам вариант
   * (§12.3) и любой выбор после окончания времени игнорируются.
   */
  resolveEvent: (optionId: string) => Promise<void>;
  /**
   * Завершает приключение, начисляет бонусы. Блокируется, пока есть неразрешённое
   * событие. Можно вызвать до истечения времени («завершить досрочно») — тогда
   * бонус за план/за задания и опыт пропорционально уменьшаются по доле
   * прошедшего времени (adventureProgressRatio); при обычном завершении (время
   * уже вышло) доля равна 1 и награда не уменьшается.
   */
  completeAdventure: () => Promise<AdventureCompletionSummary | null>;
  /**
   * Если время активного приключения вышло (по реальным часам, демо-режим не
   * в счёт) — снимает висящее событие без эффектов и завершает приключение.
   * Итоги кладутся в lastCompletionSummary для показа на хабе.
   */
  completeIfExpired: () => Promise<AdventureCompletionSummary | null>;
  /** Модалку итогов на хабе закрыли. */
  dismissCompletionSummary: () => void;
  /**
   * Ветка активного приключения — заменяет собой старый onboarding-выбор
   * «приоритетной» ветки (preferencesStore.priorityBranches): тот же бонус
   * +10% к наградам/бейдж на вкладке, но источник — текущее приключение.
   */
  isActiveBranch: (branchId: number) => boolean;
  reset: () => void;
}

/**
 * Завершение вызывается из нескольких мест (кнопка, хаб, тик таймера на
 * экране приключения) и асинхронно — без этого флага два почти одновременных
 * вызова оба увидели бы активное приключение и начислили награды дважды.
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

export const useAdventureStore = create<AdventureState>((set, get) => {
  /** Общая часть ручного и автоматического завершения (вызывается под withCompletionLock). */
  const finalizeAdventure = async (
    autoCompleted: boolean
  ): Promise<AdventureCompletionSummary | null> => {
    const { currentAdventure } = get();
    if (!currentAdventure || currentAdventure.status !== 'active') return null;
    // Приключение не может закончиться, пока не решено текущее событие.
    if (currentAdventure.pendingEventTemplateId) return null;

    const completedAt = new Date().toISOString();
    // Досрочное завершение (до истечения таймера) пропорционально уменьшает
    // награду — при обычном завершении (время вышло) ratio === 1, награда
    // полная, поведение не меняется. Это выбор ребёнка, а не ошибка/провал —
    // никакого штрафа или обнуления, просто меньшая (но всегда положительная) награда.
    // §18.2 демо-режим: приключения переключаются без ожидания — завершение в
    // любой момент считается полным (иначе в демо награда и опыт были бы ≈0 и
    // рост уровня из обязательного сценария §19 п.10 не был бы виден).
    const isDemo = useUserStore.getState().user?.is_demo ?? false;
    const completionRatio = isDemo ? 1 : adventureProgressRatio(currentAdventure, Date.now());
    const fullBonus = isPlanBonusEligible(currentAdventure) ? PLAN_BONUS : 0;
    const bonusAwarded = Math.floor(fullBonus * completionRatio);
    const xpAwarded = Math.floor(ADVENTURE_XP * completionRatio);
    // Остаток бюджета (с бонусом за план) уходит в хаб. При досрочном
    // завершении — только доля, равная пройденной части времени (решение
    // пользователя 27.09.2026): иначе «начал и сразу закрыл» приносило бы
    // весь бюджет приключения.
    const { toBank, toWallet } = computeAdventurePayout(
      currentAdventure.budget + fullBonus,
      currentAdventure.plan.savings,
      completionRatio
    );
    // Бонус банка на «коплю» — только за полностью пройденное приключение.
    const bankBonusAllowed = completionRatio >= 1;

    try {
      await getAdventureRepository().complete(currentAdventure.id, completedAt, xpAwarded);
    } catch (error) {
      console.error('[AdventureStore] Не удалось завершить приключение:', error);
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
          `Итоги приключения №${currentAdventure.adventureNumber}`
        );
    }
    try {
      const repo = getAdventureRepository();
      if (paidToBank > 0) await repo.addFact(currentAdventure.id, 'savings', paidToBank);
      await repo.setBudget(currentAdventure.id, 0);
    } catch (error) {
      console.warn('[AdventureStore] Не удалось сохранить выплату приключения:', error);
    }
    // §11.5-аналог: стрик «без снятия» считается по каждому завершённому циклу дохода.
    // Не критично для завершения приключения — если упадёт, не блокируем награды/выход.
    try {
      await useSavingsStore.getState().registerPeriodOutcome();
    } catch (error) {
      console.warn('[AdventureStore] Не удалось обновить стрик накоплений:', error);
    }

    // Level up (и species-скин на уровнях 2/3, см. PlayerLevel.ts) считается
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
    };
    set({ currentAdventure: null, usedEventTemplateIds: [], lastCompletionSummary: summary });

    return summary;
  };

  /** Событие, которое так и не решили до конца приключения, — снимается без денег/времени. */
  const expirePendingEvent = async (adventure: AdventureRecord): Promise<void> => {
    const templateId = adventure.pendingEventTemplateId;
    if (!templateId) return;
    const nowIso = new Date().toISOString();

    set({
      currentAdventure: { ...adventure, pendingEventTemplateId: null, pendingEventRolledAt: null },
      usedEventTemplateIds: [...get().usedEventTemplateIds, templateId],
    });

    try {
      const repo = getAdventureRepository();
      await repo.resolveEvent(adventure.id, nowIso);
      await repo.logEvent(adventure.id, templateId, EXPIRED_EVENT_OPTION_ID, null, 0, 0, nowIso);
    } catch (error) {
      console.warn('[AdventureStore] Не удалось сохранить истёкшее событие:', error);
    }
  };

  return {
    currentAdventure: null,
    isLoading: true,
    usedEventTemplateIds: [],
    lastCompletionSummary: null,

    loadCurrent: async (profileId) => {
      set({ isLoading: true });
      try {
        const repo = getAdventureRepository();
        const current = await repo.getCurrent(profileId);
        const usedEventTemplateIds = current ? await repo.getEventTemplateIds(current.id) : [];
        set({ currentAdventure: current, usedEventTemplateIds, isLoading: false });
      } catch (error) {
        console.error('[AdventureStore] Не удалось загрузить приключение:', error);
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
          projectedIncome: ADVENTURE_BASE_INCOME,
          budget: 0,
          plan: EMPTY_ALLOCATION,
          fact: EMPTY_ALLOCATION,
          startedAt: null,
          plannedEndAt: null,
          completedAt: null,
          timeAdjustmentMs: 0,
          questsCompleted: 0,
          xpAwarded: null,
          pendingEventTemplateId: null,
          pendingEventRolledAt: null,
          nextEventCheckAt: null,
        });

        set({ currentAdventure: created, usedEventTemplateIds: [], isLoading: false });
      } catch (error) {
        console.error('[AdventureStore] Не удалось начать планирование приключения:', error);
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
      if (!currentAdventure || currentAdventure.status !== 'planning') return;
      if (currentAdventure.branchId === null) return;
      if (totalAllocation(currentAdventure.plan) <= 0) return;

      const startedAt = new Date();
      const plannedEndAt = new Date(startedAt.getTime() + ADVENTURE_DURATION_MS);
      const nextEventCheckAt = new Date(startedAt.getTime() + EVENT_PACING.regularGapMs);

      await getAdventureRepository().setPlan(
        currentAdventure.id,
        currentAdventure.branchId,
        currentAdventure.plan
      );
      // Доход приключения — его собственный бюджет (не кошелёк хаба): план
      // распределяет ИМЕННО эту сумму на надо/хочу/коплю, тратят её события,
      // остаток в конце уходит в хаб (см. finalizeAdventure).
      const budget = currentAdventure.projectedIncome;
      await getAdventureRepository().activate(
        currentAdventure.id,
        startedAt.toISOString(),
        plannedEndAt.toISOString(),
        nextEventCheckAt.toISOString(),
        budget
      );

      set({
        currentAdventure: {
          ...currentAdventure,
          status: 'active',
          budget,
          startedAt: startedAt.toISOString(),
          plannedEndAt: plannedEndAt.toISOString(),
          nextEventCheckAt: nextEventCheckAt.toISOString(),
        },
        usedEventTemplateIds: [],
      });
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
        console.warn('[AdventureStore] Не удалось сохранить факт приключения:', error);
      }
    },

    registerQuestCompletion: async () => {
      const { currentAdventure } = get();
      if (
        !currentAdventure ||
        currentAdventure.status !== 'active' ||
        !currentAdventure.plannedEndAt
      ) {
        return;
      }

      // Задание, законченное уже после дедлайна (урок начат до него), всё
      // равно засчитывается в счётчик, но таймер не двигает — см. applyTimeAdjustment.
      const nowMs = Date.now();
      const previousEndMs = new Date(currentAdventure.plannedEndAt).getTime();
      const nextPlannedEndAt = applyTimeAdjustment(
        currentAdventure.plannedEndAt,
        -QUEST_TIME_BONUS_MS,
        nowMs,
        MIN_REMAINING_MS
      );
      const appliedDeltaMs = new Date(nextPlannedEndAt).getTime() - previousEndMs;
      const timeAdjustmentMs = currentAdventure.timeAdjustmentMs + appliedDeltaMs;
      const questsCompleted = currentAdventure.questsCompleted + 1;

      set({
        currentAdventure: {
          ...currentAdventure,
          plannedEndAt: nextPlannedEndAt,
          timeAdjustmentMs,
          questsCompleted,
        },
      });

      try {
        const repo = getAdventureRepository();
        await repo.adjustTime(currentAdventure.id, nextPlannedEndAt, timeAdjustmentMs);
        await repo.incrementQuestsCompleted(currentAdventure.id);
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить ускорение приключения:', error);
      }
    },

    registerArcadeRound: async (minutes) => {
      const { currentAdventure } = get();
      if (
        minutes <= 0 ||
        !currentAdventure ||
        currentAdventure.status !== 'active' ||
        !currentAdventure.plannedEndAt
      ) {
        return 0;
      }

      const previousEndMs = new Date(currentAdventure.plannedEndAt).getTime();
      const nextPlannedEndAt = applyTimeAdjustment(
        currentAdventure.plannedEndAt,
        -minutes * 60_000,
        Date.now(),
        MIN_REMAINING_MS
      );
      const appliedDeltaMs = new Date(nextPlannedEndAt).getTime() - previousEndMs;
      if (appliedDeltaMs === 0) return 0;
      const timeAdjustmentMs = currentAdventure.timeAdjustmentMs + appliedDeltaMs;

      set({
        currentAdventure: { ...currentAdventure, plannedEndAt: nextPlannedEndAt, timeAdjustmentMs },
      });
      try {
        await getAdventureRepository().adjustTime(
          currentAdventure.id,
          nextPlannedEndAt,
          timeAdjustmentMs
        );
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить ускорение от Аркады:', error);
      }
      return Math.round(-appliedDeltaMs / 60_000);
    },

    checkForDueEvent: async (trigger) => {
      const { currentAdventure, usedEventTemplateIds } = get();
      if (!currentAdventure) return;

      // Деньги событий — бюджет приключения, а не кошелёк хаба.
      const balance = currentAdventure.budget;
      const mood = usePetStore.getState().currentMood;
      const due = isEventDue(currentAdventure, {
        nowMs: Date.now(),
        trigger,
        balance,
        mood,
        eventsSoFar: usedEventTemplateIds.length,
      });
      if (!due) return;

      const templates = getLocalContentRepository().getAdventureEventsSync();
      // Сужаем пул шаблонов под текущее состояние игрока (мало денег/энергии) —
      // сами эффекты событий не меняются, меняется только то, какие темы могут
      // выпасть (см. selectEventPool); уже выпадавшие в этом приключении не повторяются.
      const pool = selectEventPool(templates, {
        balance,
        mood,
        projectedIncome: currentAdventure.projectedIncome,
      });
      const template = pickRandomEventTemplate(pool, usedEventTemplateIds, templates);
      if (!template) return;

      const rolledAt = new Date().toISOString();
      set({
        currentAdventure: {
          ...currentAdventure,
          pendingEventTemplateId: template.id,
          pendingEventRolledAt: rolledAt,
        },
      });

      try {
        await getAdventureRepository().rollEvent(currentAdventure.id, template.id, rolledAt);
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить новое событие:', error);
      }
    },

    resolveEvent: async (optionId) => {
      const adventure = get().currentAdventure;
      if (!adventure || adventure.status !== 'active' || !adventure.pendingEventTemplateId) return;
      // После окончания времени события не срабатывают — висящее снимет completeIfExpired.
      if (isTimeUp(adventure, Date.now())) return;

      const template = getLocalContentRepository()
        .getAdventureEventsSync()
        .find((t) => t.id === adventure.pendingEventTemplateId);
      const option = template?.options.find((o) => o.id === optionId);
      if (!template || !option) return;

      const coinAmount = option.coinAmount;

      // §12.3: при нехватке денег платный вариант недоступен целиком — без
      // частичной оплаты (иначе ускорение доставалось бы за остаток бюджета).
      // В каждом шаблоне есть бесплатный вариант, так что выбор всегда остаётся.
      if (!isOptionAffordable(option, adventure.budget)) return;

      // 1. Деньги события — только бюджет приключения: трата уменьшает бюджет и
      // идёт в fact[category] (надо/хочу), награда пополняет бюджет. Кошелёк и
      // банк хаба события не трогают. Скины события не выдают — облик
      // питомца приходит только с новым уровнем.
      let budget = adventure.budget;
      if (coinAmount < 0 && option.category) {
        const cost = -coinAmount;
        budget -= cost;
        await get().recordFact(option.category, cost);
      } else if (coinAmount > 0) {
        budget += coinAmount;
      }

      // recordFact выше уже мог обновить currentAdventure — перечитываем перед
      // тем, как построить итоговое обновление, чтобы не затереть его.
      const latest = get().currentAdventure;
      if (!latest || !latest.plannedEndAt) return;

      let plannedEndAt = latest.plannedEndAt;
      let timeAdjustmentMs = latest.timeAdjustmentMs;
      if (option.timeDeltaMinutes !== 0) {
        const nowMs = Date.now();
        const previousEndMs = new Date(latest.plannedEndAt).getTime();
        plannedEndAt = applyTimeAdjustment(
          latest.plannedEndAt,
          option.timeDeltaMinutes * 60_000,
          nowMs,
          MIN_REMAINING_MS
        );
        timeAdjustmentMs =
          latest.timeAdjustmentMs + (new Date(plannedEndAt).getTime() - previousEndMs);
      }

      const resolvedAt = new Date().toISOString();
      const nextEventCheckAt = new Date(Date.now() + EVENT_PACING.regularGapMs).toISOString();

      set({
        currentAdventure: {
          ...latest,
          budget,
          plannedEndAt,
          timeAdjustmentMs,
          pendingEventTemplateId: null,
          pendingEventRolledAt: null,
          nextEventCheckAt,
        },
        usedEventTemplateIds: [...get().usedEventTemplateIds, template.id],
      });

      try {
        const repo = getAdventureRepository();
        await repo.setBudget(latest.id, budget);
        await repo.adjustTime(latest.id, plannedEndAt, timeAdjustmentMs);
        await repo.resolveEvent(latest.id, nextEventCheckAt);
        await repo.logEvent(
          latest.id,
          template.id,
          optionId,
          option.category,
          coinAmount,
          option.timeDeltaMinutes * 60_000,
          resolvedAt
        );
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить исход события:', error);
      }
    },

    completeAdventure: () => withCompletionLock(() => finalizeAdventure(false)),

    completeIfExpired: () =>
      withCompletionLock(async () => {
        const adventure = get().currentAdventure;
        if (!adventure || !isTimeUp(adventure, Date.now())) return null;

        // На холодном старте (приложение открыли спустя часы) сторы с опытом/
        // инвентарём могут ещё восстанавливаться из AsyncStorage — начисление
        // до конца гидратации было бы затёрто (см. waitForHydration).
        await Promise.all([
          waitForHydration(useLessonsStore),
          waitForHydration(useShopStore),
          waitForHydration(usePreferencesStore),
        ]);

        const latest = get().currentAdventure;
        if (!latest || latest.id !== adventure.id || latest.status !== 'active') return null;
        await expirePendingEvent(latest);
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

    reset: () =>
      set({
        currentAdventure: null,
        isLoading: true,
        usedEventTemplateIds: [],
        lastCompletionSummary: null,
      }),
  };
});
