// domain/adventure/AdventureEvent.ts
// Случайные события во время активного приключения (собственная механика
// поверх основного цикла, в finni_tz_final.md не описана — числа подобраны
// разработчиком как разумные дефолты, см. память проекта).
// Контент — в content/adventure_events.json (§25: игровой контент отдельно
// от кода), здесь только типы и чистая логика проверки/розыгрыша.

import { AdventureRecord, BudgetCategory, planSpendRemaining, remainingMs } from './Adventure';

export interface AdventureEventOption {
  id: string;
  label: string;
  /** null — эффект не привязан к конкретной цели плана (чистая награда/чистое время). */
  category: BudgetCategory | null;
  /** Целое число монет: отрицательное — трата (спишется с кошелька и с fact[category]), положительное — награда на кошелёк. */
  coinAmount: number;
  /** Коррекция оставшегося времени в минутах: отрицательная ускоряет, положительная замедляет. */
  timeDeltaMinutes: number;
}

export interface AdventureEventTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  options: AdventureEventOption[];
  /** По каким состояниям игрока это событие может выпасть (см. selectEventPool).
   * Отсутствует/пусто — трактуется как «normal». */
  pools?: string[];
  /** Демо-режим (§18): события с demo_order выпадают первыми, по возрастанию
   * (см. pickDemoEventTemplate) — показ всегда идёт по одному сценарию. */
  demo_order?: number;
}

/**
 * Ритм событий. Базовый — ~раз в час (regularGapMs) после предыдущего события
 * или старта. При заходе на экран приключения событие может появиться раньше,
 * через entryGapMs, но только в «здоровом» состоянии игрока (см.
 * canAccelerateEvent) — так события чаще встречают ребёнка, который вернулся
 * в приключение, но не раскачивают экономику: никогда не чаще раза в
 * entryGapMs и не больше maxPerAdventure за приключение.
 */
export const EVENT_PACING = {
  /**
   * Событие не может родиться раньше этого времени с момента старта, даже
   * если nextEventCheckAt формально уже наступил (перевод системных часов при
   * ручном тестировании, долгий простой приложения) — не застаёт ребёнка
   * врасплох в первые минуты приключения.
   */
  minSinceStartMs: 5 * 60 * 1000,
  regularGapMs: 60 * 60 * 1000,
  entryGapMs: 30 * 60 * 1000,
  /** Ближе к концу событий нет вовсе — в том числе после окончания времени:
   * событие блокирует завершение, а приключение должно закончиться вовремя. */
  minRemainingMs: 20 * 60 * 1000,
  /** В последний час приключения ускорения при заходе нет. */
  accelerationMinRemainingMs: 60 * 60 * 1000,
  /** Столько же, сколько шаблонов в контенте — вместе с pickRandomEventTemplate
   * без повторов каждое событие (в т.ч. денежный подарок) выпадает не больше раза. */
  maxPerAdventure: 6,
} as const;

/**
 * Демо-режим (§18, решение пользователя 28.09.2026): весь сценарий — за 1–2
 * минуты, поэтому событие появляется при каждом заходе на экран приключения,
 * без часового ритма и стартовой задержки. Не больше двух за приключение:
 * трата с выбором «надо/хочу» и подарок (demo_order в контенте). Лимиты
 * экономики (§12.3 — платный вариант только при хватке денег) не меняются.
 */
export const DEMO_EVENT_PACING = {
  maxPerAdventure: 2,
} as const;

/** «На мели» — в бюджете приключения меньше этой доли его дохода. */
const LOW_MONEY_INCOME_RATIO = 0.2;
/** Та же граница, что отделяет 'sleeping' от 'idle' — см. constants/petAssets.ts. */
const LOW_ENERGY_THRESHOLD = 20;

function isLowMoney(balance: number, projectedIncome: number): boolean {
  return projectedIncome > 0 && balance < projectedIncome * LOW_MONEY_INCOME_RATIO;
}

function isLowEnergy(mood: number): boolean {
  return mood <= LOW_ENERGY_THRESHOLD;
}

/** 'entry' — ребёнок только что зашёл на экран приключения; 'tick' — периодическая проверка, пока экран открыт. */
export type EventTrigger = 'entry' | 'tick';

export interface EventDueContext {
  nowMs: number;
  trigger: EventTrigger;
  /** Бюджет приключения (его деньги на события — не кошелёк хаба). */
  balance: number;
  /** Энергия питомца. */
  mood: number;
  /** Сколько событий уже было в этом приключении. */
  eventsSoFar: number;
  /** Демо-профиль — ритм DEMO_EVENT_PACING вместо обычного. */
  demo?: boolean;
}

/**
 * Можно ли показать событие при заходе раньше обычного часового срока.
 * Только когда ребёнок реально может поучаствовать в выборе: у питомца есть
 * энергия, в бюджете приключения есть деньги, план трат не исчерпан (иначе
 * событие лишь подталкивает к перерасходу и потере бонуса за план) и до конца
 * ещё не меньше часа.
 */
export function canAccelerateEvent(
  adventure: AdventureRecord,
  ctx: Pick<EventDueContext, 'nowMs' | 'balance' | 'mood'>
): boolean {
  if (isLowEnergy(ctx.mood)) return false;
  if (isLowMoney(ctx.balance, adventure.projectedIncome)) return false;
  if (planSpendRemaining(adventure) <= 0) return false;
  return remainingMs(adventure, ctx.nowMs) >= EVENT_PACING.accelerationMinRemainingMs;
}

/** Пора ли родить новое событие (нет уже неразрешённого, ритм/лимиты соблюдены). */
export function isEventDue(adventure: AdventureRecord, ctx: EventDueContext): boolean {
  if (adventure.status !== 'active') return false;
  if (adventure.pendingEventTemplateId) return false;
  if (!adventure.nextEventCheckAt || !adventure.startedAt) return false;
  if (ctx.demo) {
    // Демо: событие при каждом заходе на экран (не по тикам), пока не исчерпан
    // демо-лимит; после окончания времени событий нет, как и в обычном режиме.
    return (
      ctx.trigger === 'entry' &&
      ctx.eventsSoFar < DEMO_EVENT_PACING.maxPerAdventure &&
      remainingMs(adventure, ctx.nowMs) >= EVENT_PACING.minRemainingMs
    );
  }
  if (ctx.nowMs - new Date(adventure.startedAt).getTime() < EVENT_PACING.minSinceStartMs) {
    return false;
  }
  if (remainingMs(adventure, ctx.nowMs) < EVENT_PACING.minRemainingMs) return false;
  if (ctx.eventsSoFar >= EVENT_PACING.maxPerAdventure) return false;

  // nextEventCheckAt — обычный (часовой) срок; срок при заходе выводится из
  // него, поэтому схема БД и уже идущие приключения не меняются.
  const regularDueMs = new Date(adventure.nextEventCheckAt).getTime();
  if (ctx.nowMs >= regularDueMs) return true;
  if (ctx.trigger !== 'entry' || !canAccelerateEvent(adventure, ctx)) return false;
  return ctx.nowMs >= regularDueMs - (EVENT_PACING.regularGapMs - EVENT_PACING.entryGapMs);
}

/**
 * Случайный шаблон без повторов в рамках приключения: сначала ещё не
 * выпадавший из пула, затем ещё не выпадавший из всех шаблонов, и только если
 * таких нет — любой из пула.
 */
export function pickRandomEventTemplate(
  pool: AdventureEventTemplate[],
  usedTemplateIds: string[] = [],
  allTemplates: AdventureEventTemplate[] = pool
): AdventureEventTemplate | null {
  const used = new Set(usedTemplateIds);
  const freshInPool = pool.filter((t) => !used.has(t.id));
  const freshAnywhere = allTemplates.filter((t) => !used.has(t.id));
  const candidates =
    freshInPool.length > 0 ? freshInPool : freshAnywhere.length > 0 ? freshAnywhere : pool;
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Демо-режим: следующее по demo_order ещё не выпадавшее событие. null — все
 * демо-события уже были (тогда вызывающий берёт случайное, как обычно).
 */
export function pickDemoEventTemplate(
  templates: AdventureEventTemplate[],
  usedTemplateIds: string[] = []
): AdventureEventTemplate | null {
  const used = new Set(usedTemplateIds);
  const ordered = templates
    .filter((t) => t.demo_order !== undefined && !used.has(t.id))
    .sort((a, b) => (a.demo_order ?? 0) - (b.demo_order ?? 0));
  return ordered[0] ?? null;
}

/** §12.3: платный вариант доступен, только если хватает денег целиком — без частичной оплаты. */
export function isOptionAffordable(option: AdventureEventOption, balance: number): boolean {
  return option.coinAmount >= 0 || balance >= -option.coinAmount;
}

export interface EventPoolContext {
  balance: number;
  mood: number;
  projectedIncome: number;
}

/**
 * Сужает список шаблонов до тех, что подходят текущему состоянию игрока
 * (мало денег / мало энергии), не трогая сами эффекты событий — только то,
 * какие темы вообще могут выпасть. pickRandomEventTemplate вызывается уже на
 * результате этой функции и остаётся простым uniform random внутри пула.
 * Если применимых пулов несколько — объединяет их шаблоны. Если ни один
 * шаблон не помечен активным пулом (опечатка в контенте и т.п.) — отдаёт
 * все шаблоны без фильтра, чтобы событие не перестало выпадать вовсе.
 */
export function selectEventPool(
  templates: AdventureEventTemplate[],
  context: EventPoolContext
): AdventureEventTemplate[] {
  const activePools: string[] = [];
  if (isLowMoney(context.balance, context.projectedIncome)) {
    activePools.push('low_money');
  }
  if (isLowEnergy(context.mood)) {
    activePools.push('low_energy');
  }
  if (activePools.length === 0) activePools.push('normal');

  const filtered = templates.filter((t) => t.pools?.some((pool) => activePools.includes(pool)));
  return filtered.length > 0 ? filtered : templates;
}
