// lib/stores/adventureStore.ts
// Жизненный цикл «Работы» (смены; в коде — adventure): planning -> active -> completed.
// Смена = один урок (решение пользователя 28.09.2026): при старте фиксируется
// урок — следующий непройденный урок выбранной темы. Смена длится до 24 часов
// и заканчивается, когда урок пройден (LessonPlayer вызывает completeAdventure)
// или время вышло (completeIfExpired) — тогда урок продолжится в следующую
// смену с того же места. Итоги показываются на хабе. Опыта смена не даёт —
// его дают уроки (useLessonsStore.finishLesson), в том числе урок смены.
// Смена платит только за этапы, пройденные в ней (решение 29.09.2026):
// зарплата — за оставшиеся к старту этапы урока, выплата при досрочном
// завершении — доля этапов этой смены (Adventure.shiftCompletionRatio).
//
// Опыт урока смены (и новый уровень) попадает в итоги: после окна итогов хаб
// показывает окно «Опыт и уровень» (решение пользователя 29.09.2026).
//
// Смена НЕ создаётся автоматически при заходе на хаб — только явным действием
// ребёнка (кнопка «Начать работу» / тап по ноутбуку), см. startPlanning().

import {
  getAdventureRepository,
  getProfileRepository,
  getTransactionRepository,
} from '@/data/local/repositories';
import { runInTransaction } from '@/data/local/transaction';
import {
  AdventureAllocation,
  AdventureRecord,
  BudgetCategory,
  canAfford,
  computeAdventurePayout,
  isPlanBonusEligible,
  isTimeUp,
  remainingStagesSalary,
  shiftCompletionRatio,
  totalAllocation,
} from '@/domain/adventure/Adventure';
import type {
  LessonCoffeeContent,
  LessonContent,
  LessonEventOptionContent,
} from '@/domain/content/LessonContent';
import { lessonSalary } from '@/domain/lesson/lessonEconomy';
import { planForLesson } from '@/domain/lesson/LessonPlan';
import {
  completedNodeCount,
  createLessonProgress,
  totalNodeCount,
} from '@/domain/lesson/lessonProgress';
import {
  LESSONS,
  LessonRewardResult,
  LevelUpResult,
  useLessonsStore,
  waitForLessonsLoaded,
} from '@/lib/hooks/useLessons';
import { create } from 'zustand';
import { useShopStore } from '@/lib/hooks/useShop';
import { isPetEnergyFull, usePetStore } from './petStore';
import { usePreferencesStore } from './preferencesStore';
import {
  finishPlannedDeposit,
  persistPlannedDeposit,
  planAdventureDeposit,
  useSavingsStore,
} from './savingsStore';
import { useUserStore } from './userStore';
import { waitForHydration } from './waitForHydration';

/** Смена длится до 24 часов (решение пользователя 28.09.2026). */
export const ADVENTURE_DURATION_MS = 24 * 60 * 60 * 1000;
/** Доход смены до выбора темы — пока урок смены не известен. Потом —
 * зарплата урока: price × надбавка предметов (lessonEconomy.lessonSalary). */
export const ADVENTURE_BASE_INCOME = 100;
const PLAN_BONUS = 10; // монет в бюджет смены — «факт трат ≤ план»

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
  /** Сколько этапов было пройдено к старту смены — смена платит за остальные. */
  nodesDoneAtStart: number;
  finished: boolean;
}

/** Опыт за смену — окно «Опыт и уровень» на хабе после итогов. */
export interface ShiftXpReport {
  /** Опыт за урок смены (> 0). */
  gained: number;
  /** Опыт игрока после начисления: полоска идёт от (totalAfter − gained). */
  totalAfter: number;
  /** Переход уровня (уже выдан: монеты, облик в хранилище). */
  levelUp: LevelUpResult | null;
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
  /** Доля выплаты: сколько из оставшихся к старту этапов пройдено в этой смене (1 — урок пройден). */
  completionRatio: number;
  /** true — смена закончилась сама, потому что 24 часа вышли (completeIfExpired). */
  autoCompleted: boolean;
  /** null — смена старой модели, без урока. */
  lesson: ShiftLessonSummary | null;
  /** Опыт урока смены; null — урок в этой смене не пройден, опыта не было. */
  xp: ShiftXpReport | null;
}

/** Окно «Опыт и уровень» ждёт показа: итоги уже закрыты, id смены — для хранилища. */
export interface PendingLevelReport {
  adventureId: number;
  report: ShiftXpReport;
}

interface AdventureState {
  currentAdventure: AdventureRecord | null;
  isLoading: boolean;
  /**
   * Итоги последней завершённой смены — показываются модалкой на хабе, пока
   * их не закроют; хранятся и в SQLite (pending_summary), переживают перезапуск.
   */
  lastCompletionSummary: AdventureCompletionSummary | null;
  /**
   * Окно «Опыт и уровень» — после итогов смены, если урок смены дал опыт.
   * Пока его не закрыли, итоги смены остаются в SQLite (с пометкой, что
   * окно итогов уже закрыто) — окно переживает перезапуск.
   */
  pendingLevelReport: PendingLevelReport | null;

  /** Загружает текущую незавершённую смену профиля, ничего не создавая. */
  loadCurrent: (profileId: string) => Promise<void>;
  /** Явно начинает планирование новой смены (если текущей ещё нет). */
  startPlanning: (profileId: string) => Promise<void>;
  /** Выбор темы — до подтверждения плана, только в памяти; доход смены —
   * зарплата следующего урока темы. */
  setBranch: (branchId: number) => void;
  /** Редактирование распределения будущего дохода — до подтверждения, только в памяти. */
  updatePlan: (plan: AdventureAllocation) => void;
  /**
   * Сколько монет из кошелька добавить в бюджет смены — до подтверждения,
   * только в памяти; не больше, чем в кошельке, и не меньше 0.
   */
  setWalletContribution: (amount: number) => void;
  /**
   * Фиксирует план и урок смены (следующий непройденный урок темы), ставит
   * конец смены через 24 часа, списывает добавленные монеты из кошелька в
   * бюджет. false — нет темы, пустой план, в теме не осталось непройденных
   * уроков или в кошельке меньше добавленного.
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
   * Трата из бюджета смены на желаемое (подсказка в игре, кофе): бюджет
   * уменьшается, факт «хочу» растёт. false — смена не идёт или не хватает (§12.3).
   */
  spendOnWant: (amount: number) => Promise<boolean>;
  /** Кофе — раз за смену, с первого этапа: трата на «Хочу» и +энергия.
   * false — уже куплен, энергия и так полная или не хватает бюджета. */
  buyCoffee: (coffee: LessonCoffeeContent) => Promise<boolean>;
  /**
   * Завершает смену: урок пройден (LessonPlayer) или ✕ раньше времени. Если
   * урок не пройден, награда пропорциональна пройденной доле урока — это не
   * штраф, а выбор ребёнка; урок продолжится в следующую смену.
   */
  completeAdventure: (
    lessonReward?: LessonRewardResult
  ) => Promise<AdventureCompletionSummary | null>;
  /** 24 часа вышли — завершает смену (итоги — в lastCompletionSummary для показа на хабе). */
  completeIfExpired: () => Promise<AdventureCompletionSummary | null>;
  /**
   * Модалку итогов на хабе закрыли — итоги больше не показываются и после
   * перезапуска. Урок смены дал опыт — дальше окно «Опыт и уровень».
   */
  dismissCompletionSummary: () => void;
  /** Окно «Опыт и уровень» закрыли — оно больше не показывается. */
  dismissLevelReport: () => void;
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

/** Итоги без самой смены — то, что хранится к смене до показа (pending_summary). */
type StoredSummary = Omit<AdventureCompletionSummary, 'adventure'> & {
  /** Окно итогов закрыто, ждёт только окно «Опыт и уровень». */
  summaryShown?: boolean;
};

export function serializeCompletionSummary(
  summary: AdventureCompletionSummary,
  summaryShown = false
): string {
  const stored: StoredSummary = {
    bonusAwarded: summary.bonusAwarded,
    toBank: summary.toBank,
    bankBonus: summary.bankBonus,
    toWallet: summary.toWallet,
    completionRatio: summary.completionRatio,
    autoCompleted: summary.autoCompleted,
    lesson: summary.lesson,
    xp: summary.xp,
    ...(summaryShown ? { summaryShown: true } : {}),
  };
  return JSON.stringify(stored);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Опыт смены из хранилища; битый или без опыта — null (окна уровня не будет). */
function parseXpReport(value: unknown): ShiftXpReport | null {
  if (!value || typeof value !== 'object') return null;
  const xp = value as Partial<ShiftXpReport>;
  if (!isNumber(xp.gained) || xp.gained <= 0 || !isNumber(xp.totalAfter)) return null;
  const levelUp = xp.levelUp as Partial<LevelUpResult> | null | undefined;
  const validLevelUp =
    levelUp && isNumber(levelUp.from) && isNumber(levelUp.to)
      ? {
          from: levelUp.from,
          to: levelUp.to,
          coins: isNumber(levelUp.coins) ? levelUp.coins : 0,
          skinName: typeof levelUp.skinName === 'string' ? levelUp.skinName : null,
          skinItemId: isNumber(levelUp.skinItemId) ? levelUp.skinItemId : null,
        }
      : null;
  return { gained: xp.gained, totalAfter: xp.totalAfter, levelUp: validLevelUp };
}

/** Итоги из хранилища; битые данные — null (окно просто не покажется). */
export function parseCompletionSummary(
  adventure: AdventureRecord,
  json: string
): AdventureCompletionSummary | null {
  try {
    const stored = JSON.parse(json) as Partial<StoredSummary>;
    const numbers = [
      stored.bonusAwarded,
      stored.toBank,
      stored.bankBonus,
      stored.toWallet,
      stored.completionRatio,
    ];
    if (!numbers.every(isNumber)) return null;
    return {
      adventure,
      bonusAwarded: stored.bonusAwarded!,
      toBank: stored.toBank!,
      bankBonus: stored.bankBonus!,
      toWallet: stored.toWallet!,
      completionRatio: stored.completionRatio!,
      autoCompleted: stored.autoCompleted === true,
      // Итоги, записанные до 29.09.2026, — без этапов к старту смены.
      lesson: stored.lesson
        ? { ...stored.lesson, nodesDoneAtStart: stored.lesson.nodesDoneAtStart ?? 0 }
        : null,
      // Итоги, записанные до 29.09.2026, — без опыта.
      xp: parseXpReport(stored.xp),
    };
  } catch {
    return null;
  }
}

/** Окно итогов уже закрыто — после перезапуска ждёт только окно уровня. */
function isSummaryShown(json: string): boolean {
  try {
    return (JSON.parse(json) as StoredSummary).summaryShown === true;
  } catch {
    return false;
  }
}

/** Этапы урока на треке: сколько пройдено сейчас и сколько всего (как у трека смены). */
function lessonStages(lesson: LessonContent): { done: number; total: number; finished: boolean } {
  const isDemo = useUserStore.getState().user?.is_demo ?? false;
  const plan = planForLesson(lesson, isDemo);
  const state =
    useLessonsStore.getState().lessonStates[lesson.id] ?? createLessonProgress(lesson.id);
  return {
    done: completedNodeCount(plan, state),
    total: totalNodeCount(plan),
    finished: Boolean(state.completedAt),
  };
}

/** Сколько урока смены пройдено сейчас (для выплаты и итогов). */
function shiftLessonProgress(adventure: AdventureRecord): ShiftLessonSummary | null {
  if (adventure.lessonId === null) return null;
  const lesson = LESSONS.find((l) => l.id === adventure.lessonId);
  if (!lesson) return null;
  const stages = lessonStages(lesson);
  return {
    id: lesson.id,
    title: lesson.title,
    nodesDone: stages.done,
    nodesTotal: stages.total,
    nodesDoneAtStart: adventure.stagesDoneAtStart,
    finished: stages.finished,
  };
}

/**
 * Зарплата смены по теме: следующий непройденный урок × надбавка предметов —
 * за оставшиеся этапы, если урок уже начат (смена платит только за свои).
 * null — в теме не осталось уроков. Её же показывает планирование.
 */
export function shiftSalary(branchId: number | null): number | null {
  if (branchId === null) return null;
  const lesson = useLessonsStore.getState().getNextLessonInBranch(branchId);
  if (!lesson) return null;
  const salary = lessonSalary(lesson, useShopStore.getState().getTotalCoinBonusPercent());
  const stages = lessonStages(lesson);
  return remainingStagesSalary(salary, stages.done, stages.total);
}

export const useAdventureStore = create<AdventureState>((set, get) => {
  /** Общая часть ручного и автоматического завершения (вызывается под withCompletionLock). */
  const finalizeAdventure = async (
    autoCompleted: boolean,
    lessonReward?: LessonRewardResult
  ): Promise<AdventureCompletionSummary | null> => {
    const { currentAdventure } = get();
    if (!currentAdventure || currentAdventure.status !== 'active') return null;

    const completedAt = new Date().toISOString();
    const lesson = shiftLessonProgress(currentAdventure);
    // Доля награды — сколько из оставшихся к старту этапов пройдено в ЭТОЙ
    // смене (урок пройден — полная). Иначе «начал смену и дождался конца»
    // приносило бы весь бюджет, ничего не пройдя, а на начатом уроке — снова
    // и снова. Это не штраф: урок продолжится в следующую смену.
    // Урок смены убрали из content/lessons — платить не за что (свои монеты из
    // кошелька вернутся). Смена старой модели (без урока) — как раньше.
    // §18.2 демо-режим: завершение в любой момент — полная выплата (показ
    // итогов не ждёт прохождения урока целиком).
    const isDemo = useUserStore.getState().user?.is_demo ?? false;
    const lessonMissing = currentAdventure.lessonId !== null && !lesson;
    const completionRatio = lessonMissing
      ? 0
      : isDemo || !lesson || lesson.finished
        ? 1
        : shiftCompletionRatio(lesson.nodesDone, lesson.nodesDoneAtStart, lesson.nodesTotal);
    const fullBonus = isPlanBonusEligible(currentAdventure) ? PLAN_BONUS : 0;
    const bonusAwarded = Math.floor(fullBonus * completionRatio);
    const { toBank, toWallet } = computeAdventurePayout(
      currentAdventure.budget + fullBonus,
      currentAdventure.plan.savings,
      completionRatio,
      currentAdventure.walletContribution
    );
    // Бонус банка на «коплю» — только за пройденный урок.
    const bankBonusAllowed = completionRatio >= 1;

    // Выплата в хаб: «коплю» — в банк (новые деньги, с бонусом банка), остальное
    // — в кошелёк. Если банк ещё не загружен — всё в кошелёк, чтобы монеты не пропали.
    const deposit = toBank > 0 ? planAdventureDeposit(toBank, bankBonusAllowed) : null;
    const paidToBank = deposit ? toBank : 0;
    const paidToWallet = toWallet + (toBank > 0 && !deposit ? toBank : 0);
    const user = useUserStore.getState().user;
    const walletPaid = paidToWallet > 0 && user !== null;

    const summary: AdventureCompletionSummary = {
      adventure: {
        ...currentAdventure,
        status: 'completed',
        completedAt,
        xpAwarded: 0,
        budget: 0,
        fact: { ...currentAdventure.fact, savings: currentAdventure.fact.savings + paidToBank },
      },
      bonusAwarded,
      toBank: paidToBank,
      bankBonus: deposit?.bonus ?? 0,
      toWallet: paidToWallet,
      completionRatio,
      autoCompleted,
      lesson,
      // Опыт урока уже начислен (finishLesson) — здесь только для окна уровня.
      xp:
        lessonReward && lessonReward.xp > 0
          ? {
              gained: lessonReward.xp,
              totalAfter: useLessonsStore.getState().totalXp,
              levelUp: lessonReward.levelUp,
            }
          : null,
    };

    // §4.5: смена, банк, кошелёк и итоги — одной транзакцией SQLite: либо всё,
    // либо ничего. Раньше смена помечалась завершённой до выплаты, и сбой
    // посередине терял монеты. Не записалось — смена остаётся активной, её
    // можно завершить снова (двойной выплаты нет: ничего не применено).
    try {
      await runInTransaction(async () => {
        const repo = getAdventureRepository();
        // Опыта смена не даёт (его дают уроки) — xp_awarded остаётся 0.
        await repo.complete(currentAdventure.id, completedAt, 0);
        await repo.setBudget(currentAdventure.id, 0);
        if (paidToBank > 0) await repo.addFact(currentAdventure.id, 'savings', paidToBank);
        if (deposit) await persistPlannedDeposit(deposit);
        if (walletPaid) {
          await getTransactionRepository().add({
            profileId: user.id,
            amount: paidToWallet,
            transactionType: 'adventure_payout',
            description: `Итоги смены №${currentAdventure.adventureNumber}`,
          });
          // Баланс — от актуального в памяти на момент записи.
          const balance = (useUserStore.getState().user?.liquid_balance ?? 0) + paidToWallet;
          await getProfileRepository().updateBalance(user.id, balance);
        }
        // Итоги — к смене, пока окно не закрыто: закрыл приложение сразу после
        // урока — хаб покажет их после перезапуска.
        await repo.setPendingSummary(currentAdventure.id, serializeCompletionSummary(summary));
      });
    } catch (error) {
      console.error('[AdventureStore] Не удалось завершить смену:', error);
      return null;
    }

    // Записано — теперь память сторов. Кошелёк раньше банка: достигнутая цель
    // (finishPlannedDeposit) пишет свою награду от баланса уже с выплатой.
    if (walletPaid) {
      useUserStore.getState().applyPersistedTransaction(paidToWallet, 'adventure_payout');
    }
    if (deposit) await finishPlannedDeposit(deposit);
    // §11.5-аналог: стрик «без снятия» считается по каждому завершённому циклу дохода.
    try {
      await useSavingsStore.getState().registerPeriodOutcome();
    } catch (error) {
      console.warn('[AdventureStore] Не удалось обновить стрик накоплений:', error);
    }

    set({ currentAdventure: null, lastCompletionSummary: summary });
    return summary;
  };

  return {
    currentAdventure: null,
    isLoading: true,
    lastCompletionSummary: null,
    pendingLevelReport: null,

    loadCurrent: async (profileId) => {
      set({ isLoading: true });
      try {
        const repo = getAdventureRepository();
        const current = await repo.getCurrent(profileId);
        set({ currentAdventure: current, isLoading: false });
        // Непоказанные итоги прошлой смены (приложение закрыли до окна итогов)
        // или непоказанное окно уровня (итоги закрыли, окно уровня — нет).
        if (!get().lastCompletionSummary && !get().pendingLevelReport) {
          const pending = await repo.getPendingSummary(profileId);
          const summary = pending && parseCompletionSummary(pending.adventure, pending.summaryJson);
          if (pending && summary && !get().lastCompletionSummary && !get().pendingLevelReport) {
            if (!isSummaryShown(pending.summaryJson)) {
              set({ lastCompletionSummary: summary });
            } else if (summary.xp) {
              set({
                pendingLevelReport: { adventureId: summary.adventure.id, report: summary.xp },
              });
            }
          }
        }
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
          walletContribution: 0,
          coffeeBought: false,
          stagesDoneAtStart: 0,
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
      set({
        currentAdventure: {
          ...currentAdventure,
          branchId,
          projectedIncome: shiftSalary(branchId) ?? currentAdventure.projectedIncome,
        },
      });
    },

    updatePlan: (plan) => {
      const { currentAdventure } = get();
      if (!currentAdventure || currentAdventure.status !== 'planning') return;
      set({ currentAdventure: { ...currentAdventure, plan } });
    },

    setWalletContribution: (amount) => {
      const { currentAdventure } = get();
      if (!currentAdventure || currentAdventure.status !== 'planning') return;
      const wallet = useUserStore.getState().user?.liquid_balance ?? 0;
      const walletContribution = Math.max(0, Math.min(Math.floor(amount), wallet));
      set({ currentAdventure: { ...currentAdventure, walletContribution } });
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

      // Монеты из кошелька (§12.3: баланс не уходит в минус) — списываются
      // сразу при старте; не хватает — смена не начинается.
      const walletContribution = currentAdventure.walletContribution;
      if (walletContribution > 0) {
        const paid = useUserStore
          .getState()
          .recordTransaction(
            -walletContribution,
            'adventure_budget',
            `В бюджет смены №${currentAdventure.adventureNumber}`
          );
        if (!paid) return false;
      }

      const startedAt = new Date();
      const plannedEndAt = new Date(startedAt.getTime() + ADVENTURE_DURATION_MS);

      await getAdventureRepository().setPlan(
        currentAdventure.id,
        currentAdventure.branchId,
        currentAdventure.plan
      );
      // Зарплата смены — price урока × надбавка предметов (и добавленное из
      // кошелька) — её собственный бюджет: план распределяет ИМЕННО эту сумму на
      // «потратить» и «коплю», тратят её события урока, подсказки и кофе,
      // остаток в конце уходит в хаб (см. finalizeAdventure).
      // Урок уже начат — зарплата только за оставшиеся этапы, и сколько их было
      // пройдено к старту, запоминается: смена платит только за свои этапы.
      const projectedIncome =
        shiftSalary(currentAdventure.branchId) ?? currentAdventure.projectedIncome;
      const budget = projectedIncome + walletContribution;
      const stagesDoneAtStart = lessonStages(lesson).done;
      try {
        await getAdventureRepository().activate(
          currentAdventure.id,
          startedAt.toISOString(),
          plannedEndAt.toISOString(),
          budget,
          lesson.id,
          walletContribution,
          projectedIncome,
          stagesDoneAtStart
        );
      } catch (error) {
        // Смена не началась — монеты возвращаются в кошелёк.
        if (walletContribution > 0) {
          useUserStore
            .getState()
            .recordTransaction(
              walletContribution,
              'adventure_budget',
              'Возврат: смена не началась'
            );
        }
        throw error;
      }

      set({
        currentAdventure: {
          ...currentAdventure,
          status: 'active',
          lessonId: lesson.id,
          projectedIncome,
          stagesDoneAtStart,
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

    // Траты смены (события, подсказки, кофе): проверка и новое состояние —
    // бюджет, факт, отметка кофе — одним синхронным обновлением, до первого
    // await. Иначе две быстрые траты (двойной тап) обе проходили проверку по
    // старому бюджету: кофе покупался дважды, а бюджет мог уйти в минус.
    applyLessonEventChoice: async (eventId, option) => {
      const adventure = get().currentAdventure;
      if (!adventure || adventure.status !== 'active') return false;
      if (!canAfford(option.coinAmount, adventure.budget)) return false;

      const spend = option.coinAmount < 0 && option.category ? option.category : null;
      const cost = spend ? -option.coinAmount : 0;
      const income = Math.max(0, option.coinAmount);
      const budget = adventure.budget - cost + income;
      set({
        currentAdventure: {
          ...adventure,
          budget,
          fact: spend
            ? { ...adventure.fact, [spend]: adventure.fact[spend] + cost }
            : adventure.fact,
        },
      });

      try {
        const repo = getAdventureRepository();
        await repo.setBudget(adventure.id, budget);
        if (spend) await repo.addFact(adventure.id, spend, cost);
        await repo.logEvent(
          adventure.id,
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

    spendOnWant: async (amount) => {
      const adventure = get().currentAdventure;
      if (!adventure || adventure.status !== 'active') return false;
      if (amount <= 0) return true;
      if (!canAfford(-amount, adventure.budget)) return false;
      const budget = adventure.budget - amount;
      set({
        currentAdventure: {
          ...adventure,
          budget,
          fact: { ...adventure.fact, optional: adventure.fact.optional + amount },
        },
      });
      try {
        const repo = getAdventureRepository();
        await repo.setBudget(adventure.id, budget);
        await repo.addFact(adventure.id, 'optional', amount);
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить трату смены:', error);
      }
      return true;
    },

    buyCoffee: async (coffee) => {
      const adventure = get().currentAdventure;
      if (!adventure || adventure.status !== 'active' || adventure.coffeeBought) return false;
      // Кофе можно с первого же этапа (решение пользователя 29.09.2026), но не
      // при полной энергии — прибавлять нечего, монеты ушли бы впустую.
      if (isPetEnergyFull()) return false;
      if (!canAfford(-coffee.price, adventure.budget)) return false;
      const budget = adventure.budget - coffee.price;
      set({
        currentAdventure: {
          ...adventure,
          budget,
          coffeeBought: true,
          fact: { ...adventure.fact, optional: adventure.fact.optional + coffee.price },
        },
      });
      usePetStore.getState().restoreEnergy(coffee.energy);
      try {
        const repo = getAdventureRepository();
        await repo.setBudget(adventure.id, budget);
        await repo.addFact(adventure.id, 'optional', coffee.price);
        await repo.setCoffeeBought(adventure.id);
      } catch (error) {
        console.warn('[AdventureStore] Не удалось сохранить покупку кофе:', error);
      }
      return true;
    },

    completeAdventure: (lessonReward) =>
      withCompletionLock(() => finalizeAdventure(false, lessonReward)),

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

    dismissCompletionSummary: () => {
      const summary = get().lastCompletionSummary;
      if (!summary) return;
      // Урок смены дал опыт — следом окно «Опыт и уровень»; итоги остаются в
      // хранилище с пометкой «окно итогов закрыто», пока не закроют и его.
      const levelReport = summary.xp
        ? { adventureId: summary.adventure.id, report: summary.xp }
        : null;
      set({ lastCompletionSummary: null, pendingLevelReport: levelReport });
      getAdventureRepository()
        .setPendingSummary(
          summary.adventure.id,
          levelReport ? serializeCompletionSummary(summary, true) : null
        )
        .catch((error) => console.warn('[AdventureStore] Не удалось закрыть итоги смены:', error));
    },

    dismissLevelReport: () => {
      const pending = get().pendingLevelReport;
      if (!pending) return;
      set({ pendingLevelReport: null });
      getAdventureRepository()
        .setPendingSummary(pending.adventureId, null)
        .catch((error) => console.warn('[AdventureStore] Не удалось закрыть окно уровня:', error));
    },

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
        pendingLevelReport: null,
      }),
  };
});
