// domain/adventure/Adventure.ts
// «Приключение» — объединяет планирование бюджета и прохождение уроков в один
// цикл: план (надо/хочу/коплю) → выбор компетенции → 8 реальных часов работы
// (ускоряется заданиями-уроками, прерывается часовыми событиями) → итог.
// Полностью заменяет собой GamePeriod (§7 ТЗ) — план/факт/бонус за план те же,
// но привязаны к конкретной ветке обучения и реальному времени, а не к кнопке
// «Завершить период».

export type BudgetCategory = 'mandatory' | 'optional' | 'savings';

export interface AdventureAllocation {
  mandatory: number;
  optional: number;
  savings: number;
}

export type AdventureStatus = 'planning' | 'active' | 'completed';

export interface AdventureRecord {
  id: number;
  profileId: string;
  adventureNumber: number;
  status: AdventureStatus;
  /** Выбранная компетенция (ветка обучения) — задаётся вместе с планом, до активации. */
  branchId: number | null;
  /** Сколько монет заработает это приключение — известно уже на планировании. */
  projectedIncome: number;
  /**
   * Бюджет приключения — отдельный от хаба контур денег: доход приключения при
   * старте + награды событий − траты событий. Живёт только в приключении; в
   * конце остаток уходит в хаб (см. computeAdventurePayout). Магазин и банк
   * хаба его не касаются.
   */
  budget: number;
  plan: AdventureAllocation;
  fact: AdventureAllocation;
  /** Устанавливается при переходе planning -> active. */
  startedAt: string | null;
  /** startedAt + 8ч + суммарная коррекция от заданий/событий. */
  plannedEndAt: string | null;
  completedAt: string | null;
  /** Накопленная коррекция таймера (мс): отрицательная — ускорение, положительная — задержка. */
  timeAdjustmentMs: number;
  questsCompleted: number;
  xpAwarded: number | null;
  /** Пока не null — есть неразрешённое случайное событие; приключение нельзя завершить (см. AdventureEvent.ts). */
  pendingEventTemplateId: string | null;
  pendingEventRolledAt: string | null;
  /** Когда в следующий раз проверять «не пора ли новое событие» (~раз в час). */
  nextEventCheckAt: string | null;
}

export function totalAllocation(allocation: AdventureAllocation): number {
  return allocation.mandatory + allocation.optional + allocation.savings;
}

/**
 * Планирование дохода: меняет одну категорию на `value`, но клэмпит её так,
 * чтобы сумма всех трёх категорий никогда не превысила `available` — клэмп
 * именно в [0, available - сумма ДВУХ ДРУГИХ категорий], а не в [0, available]
 * для каждой по отдельности, иначе каждую из трёх можно было бы независимо
 * докрутить до available и уйти в общий минус (см. adventure-planning.tsx).
 */
export function clampAllocationAmount(
  current: AdventureAllocation,
  key: keyof AdventureAllocation,
  value: number,
  available: number
): AdventureAllocation {
  const otherTotal = totalAllocation(current) - current[key];
  const maxForKey = Math.max(0, available - otherTotal);
  const clamped = Math.max(0, Math.min(value, maxForKey));
  return { ...current, [key]: clamped };
}

/**
 * План трат приключения — одна категория «Потратить» (решение пользователя
 * 27.09.2026: на планировании только «Потратить» и «Коплю»). Новые планы
 * пишут её в plan.mandatory при plan.optional = 0; сумма надо+хочу
 * сохраняет корректность и для приключений, начатых по старой схеме.
 */
export function plannedSpend(adventure: AdventureRecord): number {
  return adventure.plan.mandatory + adventure.plan.optional;
}

/** Фактически потрачено событиями — и на нужное, и на желаемое. */
export function actualSpend(adventure: AdventureRecord): number {
  return adventure.fact.mandatory + adventure.fact.optional;
}

/** Факт трат (нужное+желаемое) не должен превышать план «Потратить»; накопления не расход. */
export function isPlanBonusEligible(adventure: AdventureRecord): boolean {
  return actualSpend(adventure) <= plannedSpend(adventure);
}

/**
 * Сколько ещё можно потратить по плану «Потратить» без потери бонуса за план.
 * 0 или меньше — бюджет трат плана исчерпан (накопления не расход).
 */
export function planSpendRemaining(adventure: AdventureRecord): number {
  return plannedSpend(adventure) - actualSpend(adventure);
}

/**
 * Выплата остатка бюджета приключения в хаб при завершении: запланированное
 * «коплю» — в банк (сколько осталось, если потрачено больше плана), всё
 * остальное — в кошелёк.
 *
 * completionRatio — доля пройденного времени (решение пользователя
 * 27.09.2026): при досрочном завершении выплачивается только эта доля
 * остатка и «коплю» (закрыл на 10% — получил 10%), остальное не выплачивается.
 * Иначе «начал и сразу закрыл» приносило бы весь бюджет.
 */
export function computeAdventurePayout(
  budget: number,
  plannedSavings: number,
  completionRatio = 1
): { toBank: number; toWallet: number } {
  const ratio = Math.max(0, Math.min(1, completionRatio));
  const remaining = Math.floor(Math.max(0, budget) * ratio);
  const savingsShare = Math.floor(Math.max(0, plannedSavings) * ratio);
  const toBank = Math.min(savingsShare, remaining);
  return { toBank, toWallet: remaining - toBank };
}

/** Оставшееся время приключения в мс на момент `nowMs` (не может быть отрицательным). */
export function remainingMs(adventure: AdventureRecord, nowMs: number): number {
  if (!adventure.plannedEndAt) return 0;
  return Math.max(0, new Date(adventure.plannedEndAt).getTime() - nowMs);
}

/** Приключение готово к завершению по времени (проверка событий — на вызывающей стороне). */
export function isTimeUp(adventure: AdventureRecord, nowMs: number): boolean {
  if (adventure.status !== 'active' || !adventure.plannedEndAt) return false;
  return nowMs >= new Date(adventure.plannedEndAt).getTime();
}

/**
 * Доля прошедшего времени приключения на момент nowMs: 0 в момент старта,
 * 1 — когда время вышло (или уже сейчас, если план/старт почему-то не заданы).
 * Используется для пропорциональной награды при досрочном завершении — см.
 * adventureStore.completeAdventure(). При обычном завершении (когда время уже
 * вышло) всегда даёт ровно 1, то есть полную награду — досрочное завершение
 * не меняет поведение обычного пути.
 */
export function adventureProgressRatio(adventure: AdventureRecord, nowMs: number): number {
  if (!adventure.startedAt || !adventure.plannedEndAt) return 1;
  const startedAtMs = new Date(adventure.startedAt).getTime();
  const totalMs = new Date(adventure.plannedEndAt).getTime() - startedAtMs;
  if (totalMs <= 0) return 1;
  const elapsedMs = nowMs - startedAtMs;
  return Math.max(0, Math.min(1, elapsedMs / totalMs));
}

/**
 * Применяет коррекцию времени (отрицательная — ускорение за задание/событие,
 * положительная — задержка от события) с нижним полом `minRemainingMs`, чтобы
 * таймер не мог обнулиться раньше, чем у события будет шанс сработать.
 *
 * Пол только ограничивает ускорение и никогда не продлевает таймер: если
 * время уже вышло — конец не двигается вовсе (иначе задание, завершённое
 * после дедлайна, «оживляло» бы закончившееся приключение на now + пол), а
 * ускорение при остатке меньше пола оставляет конец на месте.
 */
export function applyTimeAdjustment(
  currentPlannedEndAtIso: string,
  deltaMs: number,
  nowMs: number,
  minRemainingMs: number
): string {
  const currentEndMs = new Date(currentPlannedEndAtIso).getTime();
  if (currentEndMs <= nowMs) return currentPlannedEndAtIso;
  if (deltaMs >= 0) return new Date(currentEndMs + deltaMs).toISOString();

  const earliestAllowedMs = nowMs + minRemainingMs;
  const nextEndMs = Math.min(currentEndMs, Math.max(earliestAllowedMs, currentEndMs + deltaMs));
  return new Date(nextEndMs).toISOString();
}
