// domain/adventure/Adventure.ts
// «Работа» (смена; в коде — adventure) — объединяет планирование бюджета и
// урок в один цикл: план («Потратить» / «Коплю») → тема → смена до 24 часов,
// в которой проходится один урок (решение пользователя 28.09.2026) → итог.
// Смена заканчивается, когда урок пройден или 24 часа вышли; незаконченный
// урок продолжается в следующую смену с того же места. События — внутри урока
// (не по времени), платят бюджет смены.

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
  /** Урок смены — следующий непройденный урок темы, фиксируется при старте.
   * null — смена, начатая до уроков из этапов (старая модель). */
  lessonId: number | null;
  /** Сколько монет заработает это приключение — известно уже на планировании. */
  projectedIncome: number;
  /**
   * Монеты из кошелька, которые ребёнок сам добавил в бюджет на планировании
   * (решение пользователя 28.09.2026). Списываются при старте смены; при
   * досрочном завершении не делятся по доле — это его деньги
   * (computeAdventurePayout).
   */
  walletContribution: number;
  /** Кофе в этой смене уже куплен — он один раз за смену (решение 29.09.2026). */
  coffeeBought: boolean;
  /**
   * Сколько этапов урока было пройдено к старту смены (в прошлых сменах или
   * на вкладке «Уроки»). Смена платит только за этапы, пройденные в ней
   * (решение пользователя 29.09.2026): от этого числа считаются и зарплата
   * смены (за оставшиеся этапы), и доля выплаты (shiftCompletionRatio).
   */
  stagesDoneAtStart: number;
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
  /** startedAt + 24 часа — конец смены. */
  plannedEndAt: string | null;
  completedAt: string | null;
  xpAwarded: number | null;
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
 * Итог плана трат для окна итогов (решение пользователя 28.09.2026: потратил
 * меньше — похвалить, больше — без нагнетания): under — сэкономлено
 * difference монет, exact — ровно по плану, over — перерасход на difference.
 */
export function planOutcome(adventure: AdventureRecord): {
  kind: 'under' | 'exact' | 'over';
  difference: number;
} {
  const difference = plannedSpend(adventure) - actualSpend(adventure);
  if (difference > 0) return { kind: 'under', difference };
  if (difference === 0) return { kind: 'exact', difference: 0 };
  return { kind: 'over', difference: -difference };
}

/**
 * Сколько ещё можно потратить по плану «Потратить» без потери бонуса за план.
 * 0 или меньше — бюджет трат плана исчерпан (накопления не расход).
 */
export function planSpendRemaining(adventure: AdventureRecord): number {
  return plannedSpend(adventure) - actualSpend(adventure);
}

/**
 * Выплата остатка бюджета смены в хаб при завершении: запланированное
 * «коплю» — в банк (сколько осталось, если потрачено больше плана), всё
 * остальное — в кошелёк.
 *
 * completionRatio — доля пройденного урока (решение пользователя 27.09.2026):
 * если урок не пройден, выплачивается только эта доля дохода смены и «коплю»
 * (закрыл на 10% — получил 10%) — иначе «начал и сразу закрыл» приносило бы
 * весь бюджет. walletContribution — монеты, добавленные из кошелька: это
 * деньги ребёнка, они (сколько не потрачено) возвращаются целиком и первыми
 * идут в «коплю»; по доле делится только остальное.
 */
export function computeAdventurePayout(
  budget: number,
  plannedSavings: number,
  completionRatio = 1,
  walletContribution = 0
): { toBank: number; toWallet: number } {
  const ratio = Math.max(0, Math.min(1, completionRatio));
  const left = Math.max(0, budget);
  const own = Math.min(left, Math.max(0, walletContribution));
  const remaining = own + Math.floor((left - own) * ratio);
  const savings = Math.max(0, plannedSavings);
  const ownSavings = Math.min(savings, own);
  const savingsShare = ownSavings + Math.floor((savings - ownSavings) * ratio);
  const toBank = Math.min(savingsShare, remaining);
  return { toBank, toWallet: remaining - toBank };
}

/**
 * Зарплата смены за оставшиеся этапы урока (решение пользователя 29.09.2026:
 * смена платит только за этапы, пройденные в ней). Урок уже начат — в прошлой
 * смене или на вкладке «Уроки» — зарплата только за оставшуюся часть, целые
 * монеты. Так за один урок в сумме по всем сменам — не больше его зарплаты, а
 * в смене нельзя потратить деньги, которые она не принесёт.
 */
export function remainingStagesSalary(
  salary: number,
  stagesDone: number,
  stagesTotal: number
): number {
  if (stagesTotal <= 0) return salary;
  const remaining = Math.max(0, stagesTotal - Math.max(0, stagesDone));
  return Math.round((salary * remaining) / stagesTotal);
}

/**
 * Доля выплаты при завершении смены: сколько из оставшихся к её старту этапов
 * пройдено в ней. Урок пройден — 1; закончил раньше — доля; ничего не прошёл
 * — 0 (раньше доля считалась по всему прогрессу урока, и «начал — сразу
 * закончил» на начатом уроке приносило монеты снова и снова).
 */
export function shiftCompletionRatio(
  stagesDone: number,
  stagesDoneAtStart: number,
  stagesTotal: number
): number {
  const remaining = stagesTotal - stagesDoneAtStart;
  if (remaining <= 0) return 1;
  return Math.max(0, Math.min(1, (stagesDone - stagesDoneAtStart) / remaining));
}

/**
 * Хватает ли энергии на вариант события «за энергию» (решение пользователя
 * 29.09.2026: не хватает — вариант недоступен, как и платный без монет).
 */
export function canAffordEnergy(energyCost: number | undefined, energy: number): boolean {
  return !energyCost || energy >= energyCost;
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

/** §12.3: платный вариант события доступен, только если бюджета хватает целиком — без частичной оплаты. */
export function canAfford(coinAmount: number, budget: number): boolean {
  return coinAmount >= 0 || budget >= -coinAmount;
}

/** Как выбор в событии ляжет на план смены — для окна события (макет 29.09.2026). */
export interface EventChoicePreview {
  budgetBefore: number;
  budgetAfter: number;
  /** Трата — в какую корзину факта; null — пополнение или бесплатный вариант. */
  category: 'mandatory' | 'optional' | null;
  cost: number;
  factBefore: number;
  factAfter: number;
  /** «Потратить» по плану и потрачено до / после выбора (нужное + желаемое). */
  spendPlan: number;
  spendBefore: number;
  spendAfter: number;
  affordable: boolean;
}

/** Та же арифметика, что у applyLessonEventChoice, без изменения смены. */
export function previewEventChoice(
  adventure: AdventureRecord,
  option: { coinAmount: number; category: 'mandatory' | 'optional' | null }
): EventChoicePreview {
  const affordable = canAfford(option.coinAmount, adventure.budget);
  const spends = option.coinAmount < 0 && option.category !== null;
  const cost = spends ? -option.coinAmount : 0;
  const category = spends ? option.category : null;
  const factBefore = category ? adventure.fact[category] : 0;
  const spendBefore = actualSpend(adventure);
  const budgetAfter = spends
    ? adventure.budget - cost
    : adventure.budget + Math.max(0, option.coinAmount);
  return {
    budgetBefore: adventure.budget,
    budgetAfter,
    category,
    cost,
    factBefore,
    factAfter: factBefore + cost,
    spendPlan: plannedSpend(adventure),
    spendBefore,
    spendAfter: spendBefore + cost,
    affordable,
  };
}
