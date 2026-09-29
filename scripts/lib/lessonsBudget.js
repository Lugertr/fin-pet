// scripts/lib/lessonsBudget.js
// Хватит ли денег смены на урок в худшем случае (для npm run lessons:check и
// lessons:fix; решение пользователя 29.09.2026): ребёнок в каждом событии
// выбирает самый дорогой вариант и покупает все платные подсказки — бюджет
// смены всё равно не должен кончиться. Кофе не считается: на него просто не
// хватит, и кнопка не сработает.
//
// Правила — те же, что в приложении (сверяет тест
// src/domain/lesson/lessonsBudgetScript.test.ts):
// - этапы смены: «Теория» + по этапу на узел урока + финиш
//   (LessonPlan.planForLesson, lessonProgress.totalNodeCount);
// - зарплата смены — price урока (без надбавки ноутбука — худший случай) за
//   оставшиеся этапы: урок уже начат — меньше (Adventure.remainingStagesSalary),
//   поэтому проверяется старт с любого этапа;
// - демо-урок — первые DEMO_NODES узлов (DEMO_NODE_LESSON_LIMITS);
// - платные подсказки (lessonEconomy.hintPrice): у «Свайпов» — по одной на
//   вопрос с подсказкой, у «5 букв» — «Открыть букву» (одно слово на урок;
//   описание слова бесплатное), у викторины подсказок нет.

const DEFAULT_LESSON_PRICE = 100;
const DEFAULT_HINT_PRICE = 5;
const DEMO_NODES = 2;
/** Исправление поднимает price до ближайшего кратного. */
const PRICE_STEP = 10;

/** Цена одной подсказки в действии урока (0 — бесплатно или подсказок нет). */
function hintPriceOf(activity) {
  if (activity.type !== 'minigame') return 0;
  return activity.hintPrice ?? DEFAULT_HINT_PRICE;
}

/** Сколько платных подсказок можно купить в действии. */
function paidHintCount(activity) {
  if (activity.type !== 'minigame') return 0;
  if (activity.minigame_type === 'tinder_swipe') {
    return (activity.questions || []).filter((q) => q.hint && q.hint.trim()).length;
  }
  if (activity.minigame_type === 'five_letters') return 1;
  return 0;
}

/** Самая дорогая трата события: любой вариант любого события пула. */
function eventMaxSpend(activity) {
  let max = 0;
  for (const event of activity.pool || []) {
    for (const option of event.options || []) {
      if (option.coinAmount < 0) max = Math.max(max, -option.coinAmount);
    }
  }
  return max;
}

/** Худшие траты одного узла (этапа заданий): события и подсказки. */
function nodeCosts(node) {
  let events = 0;
  let hints = 0;
  for (const activity of node.activities || []) {
    if (activity.type === 'event') events += eventMaxSpend(activity);
    hints += hintPriceOf(activity) * paidHintCount(activity);
  }
  return { events, hints, total: events + hints };
}

/** Зарплата смены за оставшиеся этапы — как Adventure.remainingStagesSalary. */
function stageSalary(price, stagesDone, stagesTotal) {
  if (stagesTotal <= 0) return price;
  const remaining = Math.max(0, stagesTotal - Math.max(0, stagesDone));
  return Math.round((price * remaining) / stagesTotal);
}

/** Этапов на треке смены: «Теория» + узлы + финиш. */
function stagesTotal(nodeCount) {
  return nodeCount + 2;
}

/** Наименьшая цена урока, при которой зарплата с этапа k покрывает траты. */
function minPriceFor(cost, stagesDone, total) {
  let price = Math.max(0, Math.ceil(((cost - 0.5) * total) / (total - stagesDone)));
  while (stageSalary(price, stagesDone, total) < cost) price += 1;
  return price;
}

/**
 * Проверка урока: для полного и демо-урока и каждого этапа, с которого может
 * начаться смена, зарплата покрывает худшие траты оставшихся этапов.
 * requiredPrice — наименьшая подходящая цена (null — текущей хватает).
 */
function checkLesson(lesson) {
  const price = lesson.price ?? DEFAULT_LESSON_PRICE;
  const costs = (lesson.nodes || []).map(nodeCosts);
  const shortages = [];
  let requiredPrice = null;

  const plans = [{ demo: false, costs }];
  if (costs.length > DEMO_NODES) plans.push({ demo: true, costs: costs.slice(0, DEMO_NODES) });

  for (const plan of plans) {
    const total = stagesTotal(plan.costs.length);
    // k — этапов пройдено к старту смены: 0 — с «Теории», 1 — с первого
    // этапа заданий и т. д.; финиш трат не содержит.
    for (let k = 0; k <= plan.costs.length; k += 1) {
      const cost = plan.costs.slice(Math.max(0, k - 1)).reduce((sum, c) => sum + c.total, 0);
      if (cost === 0) continue;
      const budget = stageSalary(price, k, total);
      if (budget < cost) {
        shortages.push({ demo: plan.demo, stagesDone: k, stagesTotal: total, budget, cost });
        requiredPrice = Math.max(requiredPrice ?? 0, minPriceFor(cost, k, total));
      }
    }
  }

  const warnings = [];
  (lesson.nodes || []).forEach((node, nodeIndex) => {
    for (const activity of node.activities || []) {
      if (activity.type !== 'event') continue;
      for (const event of activity.pool || []) {
        for (const option of event.options || []) {
          if (option.category === 'optional' && option.coinAmount < 0) {
            warnings.push(
              `узел ${nodeIndex + 1}, событие ${event.id}: вариант «${option.label}» тратит ${-option.coinAmount} C на «Хочу» — события тратят только на «Нужно»`
            );
          }
        }
      }
    }
  });

  return {
    id: lesson.id,
    title: lesson.title,
    price,
    worstCost: costs.reduce((sum, c) => sum + c.total, 0),
    costs,
    shortages,
    requiredPrice,
    fixedPrice: requiredPrice === null ? null : Math.ceil(requiredPrice / PRICE_STEP) * PRICE_STEP,
    warnings,
  };
}

/** Слова «5 букв» из уроков, которых нет в банке: игра подставит случайное слово темы. */
function missingWords(lessons, bank) {
  const known = new Set(bank.map((w) => w.word));
  const missing = [];
  for (const lesson of lessons) {
    for (const node of lesson.nodes || []) {
      for (const activity of node.activities || []) {
        if (activity.type === 'minigame' && activity.word && !known.has(activity.word)) {
          missing.push({ id: lesson.id, word: activity.word });
        }
      }
    }
  }
  return missing;
}

/** Урок с новой ценой: price — сразу после order_index, как в остальных уроках. */
function withPrice(lesson, price) {
  if ('price' in lesson) return { ...lesson, price };
  const result = {};
  for (const [key, value] of Object.entries(lesson)) {
    result[key] = value;
    if (key === 'order_index') result.price = price;
  }
  if (!('price' in result)) result.price = price;
  return result;
}

module.exports = {
  DEFAULT_LESSON_PRICE,
  DEFAULT_HINT_PRICE,
  DEMO_NODES,
  PRICE_STEP,
  hintPriceOf,
  paidHintCount,
  eventMaxSpend,
  nodeCosts,
  stageSalary,
  stagesTotal,
  minPriceFor,
  checkLesson,
  missingWords,
  withPrice,
};
