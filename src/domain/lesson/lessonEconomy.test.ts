// domain/lesson/lessonEconomy.test.ts
// Экономика урока в смене (решение пользователя 29.09.2026): зарплата смены
// из price урока × надбавка предметов, энергия за этап, кофе, цена подсказки —
// всё из content/lessons, без полей — значения по умолчанию. Файла-примера
// больше нет (уроки пользователь пишет сам) — здесь свой урок со всеми полями.

import { ALL_LESSONS } from '@/data/content/lessonFiles';
import { LessonContent } from '@/domain/content/LessonContent';
import {
  DEFAULT_COFFEE,
  DEFAULT_HINT_PRICE,
  DEFAULT_LESSON_PRICE,
  DEFAULT_NODE_ENERGY_COST,
  economyErrors,
  hintPrice,
  lessonCoffee,
  lessonSalary,
  nodeEnergyCost,
} from './lessonEconomy';

const LESSONS = ALL_LESSONS;

const question = {
  id: 1,
  question_text: 'Купить?',
  options: ['Нет', 'Да'],
  correct_answer: 'Нет',
  question_type: 'minigame' as const,
  hint: 'Сравни с остатком.',
};

/** Урок со всеми полями экономики. */
const EXAMPLE: LessonContent = {
  id: 1,
  branch_id: 1,
  title: 'Пример',
  order_index: 1,
  price: 60,
  nodeEnergyCost: 10,
  coffee: { price: 30, energy: 10 },
  situation: { title: 'Ситуация', text: 'Текст' },
  nodes: [
    {
      cards: [{ title: 'Карточка', text: 'Текст' }],
      activities: [{ type: 'test', questions: [{ ...question, question_type: 'test' }] }],
    },
    {
      energyCost: 15,
      cards: [{ title: 'Карточка', text: 'Текст' }],
      activities: [
        { type: 'minigame', minigame_type: 'tinder_swipe', hintPrice: 5, questions: [question] },
      ],
    },
  ],
  conclusion: { title: 'Итог', text: 'Текст' },
};

const BARE: LessonContent = {
  ...EXAMPLE,
  price: undefined,
  nodeEnergyCost: undefined,
  coffee: undefined,
};

describe('lessonSalary — зарплата смены', () => {
  it('price урока без надбавки', () => {
    expect(lessonSalary({ price: 60 }, 0)).toBe(60);
  });

  it('надбавка предметов умножает price, монеты целые', () => {
    expect(lessonSalary({ price: 60 }, 50)).toBe(90);
    expect(lessonSalary({ price: 60 }, 33)).toBe(80);
    expect(Number.isInteger(lessonSalary({ price: 55 }, 15))).toBe(true);
  });

  it('без price — зарплата по умолчанию', () => {
    expect(lessonSalary({}, 0)).toBe(DEFAULT_LESSON_PRICE);
  });

  it('отрицательная надбавка не уменьшает зарплату', () => {
    expect(lessonSalary({ price: 60 }, -20)).toBe(60);
  });
});

describe('nodeEnergyCost — энергия за этап', () => {
  it('своя цена этапа важнее цены урока', () => {
    expect(nodeEnergyCost(EXAMPLE, 0)).toBe(10);
    expect(nodeEnergyCost(EXAMPLE, 1)).toBe(15);
  });

  it('без полей — по умолчанию', () => {
    expect(
      nodeEnergyCost({ ...BARE, nodes: [{ ...BARE.nodes[0], energyCost: undefined }] }, 0)
    ).toBe(DEFAULT_NODE_ENERGY_COST);
  });
});

describe('кофе и подсказки', () => {
  it('кофе урока или по умолчанию', () => {
    expect(lessonCoffee(EXAMPLE)).toEqual({ price: 30, energy: 10 });
    expect(lessonCoffee(BARE)).toEqual(DEFAULT_COFFEE);
  });

  it('подсказка платная только в мини-игре', () => {
    const activities = EXAMPLE.nodes.flatMap((node) => node.activities);
    const swipe = activities.find(
      (a) => a.type === 'minigame' && a.minigame_type === 'tinder_swipe'
    )!;
    const test = activities.find((a) => a.type === 'test')!;
    expect(hintPrice(swipe)).toBe(5);
    expect(hintPrice({ ...swipe, hintPrice: undefined } as typeof swipe)).toBe(DEFAULT_HINT_PRICE);
    expect(hintPrice({ ...swipe, hintPrice: 0 } as typeof swipe)).toBe(0);
    expect(hintPrice(test)).toBe(0);
  });
});

describe('economyErrors — проверка полей', () => {
  it('целые ≥ 0 — без ошибок', () => {
    expect(economyErrors(EXAMPLE)).toEqual([]);
  });

  it('дробные и отрицательные значения — ошибки', () => {
    const broken: LessonContent = {
      ...EXAMPLE,
      price: -10,
      nodeEnergyCost: 2.5,
      coffee: { price: 30, energy: -1 },
    };
    expect(economyErrors(broken)).toEqual([
      expect.stringContaining('price'),
      expect.stringContaining('nodeEnergyCost'),
      expect.stringContaining('coffee.energy'),
    ]);
  });

  it('у всех уроков content/lessons поля экономики корректны', () => {
    expect(LESSONS.flatMap(economyErrors)).toEqual([]);
  });
});
