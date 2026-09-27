// domain/achievement/Achievement.ts
// Достижения (§15 ТЗ). Модель данных расширяет §15.3 несколькими полями,
// без которых условие/награду невозможно реально исполнить (аналогично тому,
// как ItemContent уже расширяет §12.5, GiftSource — §14.4): icon/description
// для UI, target_branch_id — какую именно ветку проверять для branch_complete,
// gift_mode/gift_options_count — как именно вызвать giftsStore для reward_type
// "gift" (§15.2 явно различает «гарантированный выбор» и «случайный»).

import { format, isSameWeek } from 'date-fns';

export type AchievementConditionType =
  | 'savings_deposit_count' // §15.2 «Первая копилка» — число пополнений накоплений
  | 'branch_complete' // §15.2 «Кибер-защитник» — конкретная ветка на 100%
  | 'correct_answers_count' // §15.2 «Эрудит» — верные ответы (уроки + тренажёры)
  | 'hidden_items_owned' // §15.2 «Коллекционер» — скрытые предметы в инвентаре
  | 'lessons_completed_count' // пройдено уроков (любых веток) суммарно
  | 'streak_days_reached' // непрерывный стрик захода в приложение
  | 'level_reached' // уровень XP-системы (см. domain/player/PlayerLevel.ts)
  | 'shop_items_owned_count' // число предметов, купленных/полученных в магазин
  | 'all_branches_complete'; // все ветки компетенций пройдены на 100%

/** Только монеты: подарки выдаются лишь за 7 дней подряд (решение 27.09.2026). */
export type AchievementRewardType = 'coins';

/** Статическое определение — живёт в content/achievements.json (§25 ТЗ), не в коде. */
export interface AchievementDefinition {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: AchievementConditionType;
  condition_value: number;
  /** Только для condition_type === 'branch_complete'. */
  target_branch_id?: number;
  reward_type: AchievementRewardType;
  /** Сумма монет награды. */
  reward_amount: number;
}

/** Пользовательский прогресс — по одному на достижение (§15.3 UserAchievement). */
export interface UserAchievementRecord {
  achievementId: number;
  progress: number; // 0-100
  isCompleted: boolean;
  isClaimed: boolean;
  /** Когда условие выполнено (ISO). Нет у записей, выполненных до появления поля. */
  completedAt?: string | null;
}

/** Сырые счётчики, из которых считается прогресс — минимум, специфичный под условия §15.2. */
export interface AchievementStats {
  savingsDepositsCount: number;
  correctAnswersCount: number;
  hiddenItemsOwnedCount: number;
  /** branchId -> {completed, total} уроков в ветке (из useLessonsStore.getBranchProgress). */
  branchProgress: Record<number, { completed: number; total: number }>;
  lessonsCompletedCount: number;
  streakDaysCount: number;
  playerLevel: number;
  shopItemsOwnedCount: number;
}

export function createEmptyUserAchievement(achievementId: number): UserAchievementRecord {
  return { achievementId, progress: 0, isCompleted: false, isClaimed: false };
}

/** Прогресс 0-100 по одному достижению из текущих сырых счётчиков. */
export function computeAchievementProgress(
  def: AchievementDefinition,
  stats: AchievementStats
): number {
  switch (def.condition_type) {
    case 'savings_deposit_count':
      return clampPercent((stats.savingsDepositsCount / def.condition_value) * 100);
    case 'correct_answers_count':
      return clampPercent((stats.correctAnswersCount / def.condition_value) * 100);
    case 'hidden_items_owned':
      return clampPercent((stats.hiddenItemsOwnedCount / def.condition_value) * 100);
    case 'branch_complete': {
      if (def.target_branch_id === undefined) return 0;
      const branch = stats.branchProgress[def.target_branch_id];
      if (!branch || branch.total === 0) return 0;
      return clampPercent((branch.completed / branch.total) * 100);
    }
    case 'lessons_completed_count':
      return clampPercent((stats.lessonsCompletedCount / def.condition_value) * 100);
    case 'streak_days_reached':
      return clampPercent((stats.streakDaysCount / def.condition_value) * 100);
    case 'level_reached':
      return clampPercent((stats.playerLevel / def.condition_value) * 100);
    case 'shop_items_owned_count':
      return clampPercent((stats.shopItemsOwnedCount / def.condition_value) * 100);
    case 'all_branches_complete': {
      const doneBranches = Object.values(stats.branchProgress).filter(
        (b) => b.total > 0 && b.completed >= b.total
      ).length;
      return clampPercent((doneBranches / def.condition_value) * 100);
    }
    default:
      return 0;
  }
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Подпись открытого достижения: «открыто на этой неделе» / «открыто 12.09» /
 * «открыто» (дата неизвестна — выполнено до появления поля completedAt).
 */
export function achievementUnlockedCaption(
  completedAt: string | null | undefined,
  now: Date
): string {
  if (!completedAt) return 'открыто';
  const date = new Date(completedAt);
  if (isSameWeek(date, now, { weekStartsOn: 1 })) return 'открыто на этой неделе';
  return `открыто ${format(date, 'dd.MM')}`;
}
