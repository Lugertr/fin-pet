// domain/lesson/lessonsBudgetScript.test.ts
// Скрипты npm run lessons:check / lessons:fix (scripts/lib/lessonsBudget.js)
// считают деньги урока по тем же правилам, что и приложение: этапы смены,
// зарплата за оставшиеся этапы, демо-урок, цены подсказок. Скрипт — обычный
// JS для node, поэтому правила продублированы; этот тест не даёт им
// разойтись с кодом приложения.

import { ALL_LESSONS } from '@/data/content/lessonFiles';
import {
  DEFAULT_HINT_PRICE,
  DEFAULT_LESSON_PRICE,
  DEMO_NODES,
  checkLesson,
  hintPriceOf,
  minPriceFor,
  nodeCosts,
  paidHintCount,
  stageSalary,
  stagesTotal,
  withPrice,
} from '../../../scripts/lib/lessonsBudget';
import { remainingStagesSalary } from '@/domain/adventure/Adventure';
import { LessonContent, LessonEventOptionContent } from '@/domain/content/LessonContent';
import {
  DEFAULT_HINT_PRICE as APP_HINT_PRICE,
  DEFAULT_LESSON_PRICE as APP_LESSON_PRICE,
  hintPrice,
} from './lessonEconomy';
import { DEMO_NODE_LESSON_LIMITS, planForLesson } from './LessonPlan';
import { totalNodeCount } from './lessonProgress';

const LESSONS = ALL_LESSONS;

describe('правила скрипта совпадают с приложением', () => {
  it('значения по умолчанию', () => {
    expect(DEFAULT_LESSON_PRICE).toBe(APP_LESSON_PRICE);
    expect(DEFAULT_HINT_PRICE).toBe(APP_HINT_PRICE);
    expect(DEMO_NODES).toBe(DEMO_NODE_LESSON_LIMITS.nodes);
  });

  it('этапов на треке столько же, сколько у плана урока (и у демо)', () => {
    for (const lesson of LESSONS) {
      expect(stagesTotal(lesson.nodes.length)).toBe(totalNodeCount(planForLesson(lesson)));
      expect(stagesTotal(Math.min(lesson.nodes.length, DEMO_NODES))).toBe(
        totalNodeCount(planForLesson(lesson, true))
      );
    }
  });

  it('зарплата за оставшиеся этапы — как remainingStagesSalary', () => {
    for (const price of [0, 55, 60, 100, 137]) {
      for (let total = 2; total <= 7; total += 1) {
        for (let done = 0; done <= total; done += 1) {
          expect(stageSalary(price, done, total)).toBe(remainingStagesSalary(price, done, total));
        }
      }
    }
  });

  it('цена подсказки — как в игре', () => {
    for (const lesson of LESSONS) {
      for (const activity of lesson.nodes.flatMap((n) => n.activities)) {
        expect(hintPriceOf(activity)).toBe(hintPrice(activity));
      }
    }
  });
});

const option = (id: string, coinAmount: number): LessonEventOptionContent => ({
  id,
  label: id,
  category: coinAmount < 0 ? 'mandatory' : null,
  coinAmount,
});

/** Урок: этап 1 — событие до 20 C, этап 2 — свайпы с двумя подсказками, этап 3 — «5 букв». */
function lesson(price?: number): LessonContent {
  const card = { title: 'Карточка', text: 'Текст' };
  const swipe = {
    id: 1,
    question_text: 'Купить?',
    options: ['Нет', 'Да'],
    correct_answer: 'Нет',
    question_type: 'minigame' as const,
    hint: 'Подумай',
  };
  return {
    id: 1,
    branch_id: 1,
    title: 'Урок',
    order_index: 1,
    ...(price === undefined ? {} : { price }),
    situation: { title: 'Ситуация', text: 'Текст' },
    nodes: [
      {
        cards: [card],
        activities: [
          {
            type: 'event',
            pool: [
              {
                id: 'a',
                title: 'А',
                description: 'А',
                icon: '🚌',
                options: [option('pay', -20), option('free', 0)],
              },
              {
                id: 'b',
                title: 'Б',
                description: 'Б',
                icon: '🎁',
                options: [option('pay', -10), option('earn', 10)],
              },
            ],
          },
        ],
      },
      {
        cards: [card],
        activities: [
          {
            type: 'minigame',
            minigame_type: 'tinder_swipe',
            questions: [swipe, { ...swipe, id: 2 }, { ...swipe, id: 3, hint: undefined }],
          },
        ],
      },
      {
        cards: [card],
        activities: [{ type: 'minigame', minigame_type: 'five_letters', word: 'ДОХОД' }],
      },
    ],
    conclusion: { title: 'Итог', text: 'Текст' },
  };
}

describe('худший случай урока', () => {
  it('событие — самый дорогой вариант пула; подсказки — свайпы с подсказкой и «Открыть букву»', () => {
    const [events, swipes, word] = lesson().nodes.map(nodeCosts);
    expect(events).toEqual({ events: 20, hints: 0, total: 20 });
    expect(paidHintCount(lesson().nodes[1].activities[0])).toBe(2);
    expect(swipes.total).toBe(10);
    expect(word.total).toBe(5);
  });

  it('денег хватает — нехватки нет', () => {
    expect(checkLesson(lesson(100))).toMatchObject({ shortages: [], requiredPrice: null });
  });

  it('урок начат — зарплата за оставшиеся этапы, траты те же: нехватка и нужная цена', () => {
    // 5 этапов («Теория» + 3 + финиш), траты 35 C: с начала 40 ≥ 35, но после
    // «Теории» бюджет 32 < 35.
    const result = checkLesson(lesson(40));
    expect(result.shortages).toContainEqual(
      expect.objectContaining({ demo: false, stagesDone: 1, budget: 32, cost: 35 })
    );
    expect(result.requiredPrice).toBe(44);
    expect(result.fixedPrice).toBe(50);
    expect(checkLesson(withPrice(lesson(40), result.fixedPrice!)).shortages).toEqual([]);
  });

  it('минимальная цена — точная с учётом округления', () => {
    for (const [cost, done, total] of [
      [35, 1, 5],
      [45, 2, 6],
      [7, 3, 4],
    ]) {
      const price = minPriceFor(cost, done, total);
      expect(stageSalary(price, done, total)).toBeGreaterThanOrEqual(cost);
      expect(stageSalary(price - 1, done, total)).toBeLessThan(cost);
    }
  });

  it('price без поля ставится после order_index', () => {
    expect(Object.keys(withPrice(lesson(), 70)).slice(0, 5)).toEqual([
      'id',
      'branch_id',
      'title',
      'order_index',
      'price',
    ]);
  });
});
