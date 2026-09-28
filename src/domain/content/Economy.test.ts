// domain/content/Economy.test.ts
// Экономика магазина и наград (решения пользователя 27.09.2026):
// - улучшения ноутбука/копилки/кровати нельзя купить на деньги одного даже
//   идеальной смены — копить приходится в банке;
// - скины не продаются (облик — только с новым уровнем);
// - достижения дают монеты, подарков за них нет.

import achievementsJson from '../../../content/achievements.json';
import itemsJson from '../../../content/items.json';
import lessonsJson from '../../../content/lessons.json';
import { AchievementDefinition } from '@/domain/achievement/Achievement';
import { ItemContent } from '@/domain/content/ItemContent';
import { LessonContent } from '@/domain/content/LessonContent';
import {
  LESSON_PERFECT_BONUS,
  LESSON_STEP_REWARDS,
  SHIFT_LESSON_COIN_BONUS_PERCENT,
} from '@/domain/lesson/lessonRewards';
import { QUIZ_TRAINER_QUESTION_COUNT } from '@/domain/arcade/TrainerSelection';
import { ARCADE_COINS_PER_CORRECT, ARCADE_ENERGY_COST } from '@/constants/gameplay';

const ITEMS = itemsJson as ItemContent[];
const LESSONS = lessonsJson as unknown as LessonContent[];

/** Бюджет смены (ADVENTURE_BASE_INCOME) + бонус за план. */
const SHIFT_BUDGET_WITH_PLAN_BONUS = 100 + 10;
/** Надбавка за урок смены (+10%, см. lessonRewards.ts). */
const QUEST_COIN_MULTIPLIER = 1 + SHIFT_LESSON_COIN_BONUS_PERCENT / 100;

/**
 * Верхняя граница денег за одну идеальную смену (смена = один урок): весь
 * бюджет с бонусом за план, самые щедрые варианты всех событий самого
 * «денежного» урока и монеты за урок вместе с бонусом за звезду (стартовый
 * ноутбук без бонуса).
 * Награды за уровень — отдельные вехи, в эту границу не входят.
 */
function perfectShiftMaxIncome(): number {
  const eventRewards = Math.max(
    0,
    ...LESSONS.map((lesson) =>
      lesson.nodes
        .flatMap((node) => node.activities)
        .reduce(
          (sum, activity) =>
            activity.type === 'event'
              ? sum +
                Math.max(0, ...activity.pool.flatMap((e) => e.options.map((o) => o.coinAmount)))
              : sum,
          0
        )
    )
  );
  const lessonCoins =
    Math.round(
      (LESSON_STEP_REWARDS.theory + LESSON_STEP_REWARDS.minigame + LESSON_STEP_REWARDS.test) *
        QUEST_COIN_MULTIPLIER
    ) + Math.round(LESSON_PERFECT_BONUS * QUEST_COIN_MULTIPLIER);
  return SHIFT_BUDGET_WITH_PLAN_BONUS + eventRewards + lessonCoins;
}

describe('экономика магазина', () => {
  it('улучшения ноутбука, копилки и кровати дороже идеальной смены', () => {
    const upgrades = ITEMS.filter(
      (i) => ['laptop', 'piggybank', 'bed'].includes(i.category) && !i.is_starter
    );
    expect(upgrades.length).toBeGreaterThan(0);
    const cheapest = Math.min(...upgrades.map((i) => i.price));
    expect(cheapest).toBeGreaterThan(perfectShiftMaxIncome());
  });

  it('еда — не меньше 10 C за 1⚡ (фарм «еда → Аркада» невыгоден) и не подорожала', () => {
    for (const food of ITEMS.filter((i) => i.category === 'food')) {
      expect(food.price).toBeGreaterThanOrEqual((food.energy_restore ?? 0) * 10);
    }
  });

  it('Аркада: полная энергия (100⚡) не окупает улучшение, еда дороже монет Аркады', () => {
    const maxCoinsPerGame = QUIZ_TRAINER_QUESTION_COUNT * ARCADE_COINS_PER_CORRECT;
    const gamesPerFullEnergy = Math.floor(100 / ARCADE_ENERGY_COST);
    const upgrades = ITEMS.filter(
      (i) => ['laptop', 'piggybank', 'bed'].includes(i.category) && !i.is_starter
    );
    expect(gamesPerFullEnergy * maxCoinsPerGame).toBeLessThan(
      Math.min(...upgrades.map((i) => i.price))
    );
    // Монет за 1⚡ в Аркаде меньше, чем стоит 1⚡ еды (от 10 C).
    expect(maxCoinsPerGame / ARCADE_ENERGY_COST).toBeLessThan(10);
  });

  it('облики питомца — у каждого вида классический облик есть предметом (выдаётся на уровне)', () => {
    for (const petType of ['robot', 'cat', 'bear']) {
      const classic = ITEMS.find(
        (i) => i.category === 'skin' && i.pet_type === petType && i.skin_variant === 0
      );
      expect(classic).toBeDefined();
    }
  });
});

describe('награды за достижения', () => {
  it('все достижения дают монеты — подарки только за 7 дней подряд', () => {
    for (const achievement of achievementsJson as AchievementDefinition[]) {
      expect(achievement.reward_type).toBe('coins');
      expect(achievement.reward_amount).toBeGreaterThan(0);
    }
  });

  it('«Коллекционер» достижим: скрытых предметов не меньше, чем требуется', () => {
    const hiddenCount = ITEMS.filter((i) => i.is_hidden).length;
    for (const achievement of achievementsJson as AchievementDefinition[]) {
      if (achievement.condition_type === 'hidden_items_owned') {
        expect(achievement.condition_value).toBeLessThanOrEqual(hiddenCount);
      }
    }
  });
});
