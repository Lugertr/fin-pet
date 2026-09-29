// domain/lesson/lessonEconomy.ts
// Экономика урока в смене (решение пользователя 29.09.2026) — всё задаётся
// в content/lessons.json у каждого урока; поля необязательные, без них —
// значения по умолчанию ниже:
// - price — зарплата смены (стартовый бюджет работы), умножается на
//   надбавку предметов (ноутбук, декор — coin_bonus_percent);
// - nodeEnergyCost — энергия за каждый этап урока в смене (у этапа можно
//   задать свою — energyCost); не хватает энергии — этап не начать;
// - coffee — кофе: один раз за смену, из бюджета работы, прибавляет энергию;
// - hintPrice у мини-игры — цена подсказки;
// - energyCost у варианта события — энергия вместо денег (например, «0 C,
//   −30⚡» против «−20 C» за нужное).

import {
  LessonActivityContent,
  LessonCoffeeContent,
  LessonContent,
} from '@/domain/content/LessonContent';

/** Зарплата смены по уроку без своего price (как прежние 100 C за смену). */
export const DEFAULT_LESSON_PRICE = 100;
export const DEFAULT_NODE_ENERGY_COST = 10;
export const DEFAULT_COFFEE: LessonCoffeeContent = { price: 30, energy: 10 };
export const DEFAULT_HINT_PRICE = 5;

/** Зарплата смены: price урока × надбавка предметов, целые монеты. */
export function lessonSalary(
  lesson: Pick<LessonContent, 'price'>,
  coinBonusPercent: number
): number {
  const price = lesson.price ?? DEFAULT_LESSON_PRICE;
  return Math.round(price * (1 + Math.max(0, coinBonusPercent) / 100));
}

/** Энергия за этап «Теория» в смене — как обычный этап (решение 29.09.2026). */
export function theoryEnergyCost(lesson: Pick<LessonContent, 'nodeEnergyCost'>): number {
  return lesson.nodeEnergyCost ?? DEFAULT_NODE_ENERGY_COST;
}

/** Энергия за этап заданий узла контента nodeIndex (своя у узла, иначе — урока). */
export function nodeEnergyCost(
  lesson: Pick<LessonContent, 'nodeEnergyCost' | 'nodes'>,
  nodeIndex: number
): number {
  return lesson.nodes[nodeIndex]?.energyCost ?? lesson.nodeEnergyCost ?? DEFAULT_NODE_ENERGY_COST;
}

export function lessonCoffee(lesson: Pick<LessonContent, 'coffee'>): LessonCoffeeContent {
  return lesson.coffee ?? DEFAULT_COFFEE;
}

/** Цена подсказки мини-игры; 0 — бесплатно. */
export function hintPrice(activity: LessonActivityContent): number {
  return activity.type === 'minigame' ? (activity.hintPrice ?? DEFAULT_HINT_PRICE) : 0;
}

/** Ошибки полей экономики урока (для validateNodeLesson): всё — целые ≥ 0. */
export function economyErrors(lesson: LessonContent): string[] {
  const at = `урок ${lesson.id}`;
  const errors: string[] = [];
  const check = (value: number | undefined, what: string) => {
    if (value !== undefined && !(Number.isInteger(value) && value >= 0)) {
      errors.push(`${at}: ${what} — целое число не меньше 0`);
    }
  };
  check(lesson.price, 'price');
  check(lesson.nodeEnergyCost, 'nodeEnergyCost');
  check(lesson.coffee?.price, 'coffee.price');
  check(lesson.coffee?.energy, 'coffee.energy');
  lesson.nodes.forEach((node, n) => {
    check(node.energyCost, `energyCost этапа ${n + 1}`);
    node.activities.forEach((activity) => {
      if (activity.type === 'minigame') check(activity.hintPrice, `hintPrice этапа ${n + 1}`);
      if (activity.type === 'event') {
        for (const event of activity.pool) {
          for (const option of event.options) {
            check(option.energyCost, `energyCost варианта ${event.id}/${option.id}`);
          }
        }
      }
    });
  });
  return errors;
}
