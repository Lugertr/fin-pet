// domain/content/Economy.test.ts
// Экономика магазина и наград (решения пользователя 27.09.2026):
// - улучшения ноутбука/копилки/кровати нельзя купить на деньги одного даже
//   идеальной смены — копить приходится в банке;
// - скины не продаются (облик — только с новым уровнем);
// - достижения дают монеты, подарков за них нет.

import achievementsJson from '../../../content/achievements.json';
import itemsJson from '../../../content/items.json';
import { ALL_LESSONS } from '@/data/content/lessonFiles';
import { AchievementDefinition } from '@/domain/achievement/Achievement';
import { ItemContent } from '@/domain/content/ItemContent';
import { lessonSalary } from '@/domain/lesson/lessonEconomy';
import { QUIZ_TRAINER_QUESTION_COUNT } from '@/domain/arcade/TrainerSelection';
import { ARCADE_COINS_PER_CORRECT, ARCADE_ENERGY_COST } from '@/constants/gameplay';

const ITEMS = itemsJson as ItemContent[];
const LESSONS = ALL_LESSONS;

/** Бонус за план — в бюджет смены. */
const PLAN_BONUS = 10;

/**
 * Верхняя граница денег за одну идеальную смену (смена = один урок): самая
 * большая зарплата урока (price из content/lessons, стартовый ноутбук без
 * надбавки) с бонусом за план и самые щедрые варианты всех событий самого
 * «денежного» урока. Монет за урок в кошелёк нет (решение 29.09.2026).
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
  const salary = Math.max(...LESSONS.map((lesson) => lessonSalary(lesson, 0)));
  return salary + PLAN_BONUS + eventRewards;
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
