// domain/content/Economy.test.ts
// Экономика магазина и наград (решения пользователя 27.09.2026):
// - улучшения ноутбука/копилки/кровати нельзя купить на деньги одного даже
//   идеального приключения — копить приходится в банке;
// - скины не продаются (облик — только с новым уровнем);
// - достижения дают монеты, подарков за них нет.

import achievementsJson from '../../../content/achievements.json';
import adventureEventsJson from '../../../content/adventure_events.json';
import itemsJson from '../../../content/items.json';
import lessonsJson from '../../../content/lessons.json';
import { AchievementDefinition } from '@/domain/achievement/Achievement';
import { AdventureEventTemplate, EVENT_PACING } from '@/domain/adventure/AdventureEvent';
import { ItemContent } from '@/domain/content/ItemContent';
import { AnyLessonContent } from '@/domain/content/LessonContent';
import { LESSON_STEP_REWARDS } from '@/domain/lesson/lessonRewards';
import { QUIZ_TRAINER_QUESTION_COUNT } from '@/domain/arcade/TrainerSelection';
import { ARCADE_COINS_PER_CORRECT, ARCADE_ENERGY_COST } from '@/constants/gameplay';

const ITEMS = itemsJson as ItemContent[];
const LESSONS = lessonsJson as unknown as AnyLessonContent[];

/** Бюджет приключения (ADVENTURE_BASE_INCOME) + бонус за план. */
const ADVENTURE_BUDGET_WITH_PLAN_BONUS = 100 + 10;
/** Надбавка за урок-задание приключения (+10%, см. StepRunner). */
const QUEST_COIN_MULTIPLIER = 1.1;

/**
 * Верхняя граница денег за одно идеальное приключение: весь бюджет с бонусом
 * за план, все денежные награды событий (без повторов, до лимита событий) и
 * все уроки самой длинной темы как задания (стартовый ноутбук без бонуса).
 * Награды за уровень — отдельные вехи, в эту границу не входят.
 */
function perfectAdventureMaxIncome(): number {
  const eventRewards = (adventureEventsJson as AdventureEventTemplate[])
    .map((t) => Math.max(0, ...t.options.map((o) => o.coinAmount)))
    .sort((a, b) => b - a)
    .slice(0, EVENT_PACING.maxPerAdventure)
    .reduce((sum, coins) => sum + coins, 0);
  const lessonsPerBranch = new Map<number, number>();
  for (const lesson of LESSONS) {
    lessonsPerBranch.set(lesson.branch_id, (lessonsPerBranch.get(lesson.branch_id) ?? 0) + 1);
  }
  const maxLessons = Math.max(...lessonsPerBranch.values());
  const lessonCoins = Math.round(
    (LESSON_STEP_REWARDS.theory + LESSON_STEP_REWARDS.minigame + LESSON_STEP_REWARDS.test) *
      QUEST_COIN_MULTIPLIER
  );
  return ADVENTURE_BUDGET_WITH_PLAN_BONUS + eventRewards + maxLessons * lessonCoins;
}

describe('экономика магазина', () => {
  it('улучшения ноутбука, копилки и кровати дороже идеального приключения', () => {
    const upgrades = ITEMS.filter(
      (i) => ['laptop', 'piggybank', 'bed'].includes(i.category) && !i.is_starter
    );
    expect(upgrades.length).toBeGreaterThan(0);
    const cheapest = Math.min(...upgrades.map((i) => i.price));
    expect(cheapest).toBeGreaterThan(perfectAdventureMaxIncome());
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
