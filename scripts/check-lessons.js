// scripts/check-lessons.js
// Проверка уроков (content/lessons — файл на тему): хватит ли зарплаты смены
// на урок в худшем случае — самый дорогой вариант в каждом событии и все
// платные подсказки (кофе не считается). Смена может начаться с любого этапа
// начатого урока, а зарплата тогда — только за оставшиеся этапы, поэтому
// проверяются все точки старта, и у полного, и у демо-урока. Правила —
// scripts/lib/lessonsBudget.js.
//
// Запуск: npm run lessons:check [-- путь/к/папке/или/файлу.json]
// Код выхода 1 — у какого-то урока не хватает денег (исправление: npm run
// lessons:fix). Предупреждения (трата на «Хочу» в событии, слово «5 букв» не
// из банка) код выхода не меняют. Правила состава урока проверяет npm test.

const fs = require('fs');
const path = require('path');
const { checkLesson, missingWords } = require('./lib/lessonsBudget');
const { ROOT, DEFAULT_LESSONS_PATH, readLessonFiles } = require('./lib/lessonFiles');

const target = process.argv[2] || DEFAULT_LESSONS_PATH;
const wordsPath = path.join(ROOT, 'content', 'five_letters_words.json');

const files = readLessonFiles(target);
const lessons = files.flatMap((file) => file.lessons);
const words = fs.existsSync(wordsPath) ? JSON.parse(fs.readFileSync(wordsPath, 'utf8')) : [];

console.log(
  `Проверка денег: ${path.relative(ROOT, path.resolve(target))} (файлов: ${files.length})`
);
console.log(
  'Худший случай: самый дорогой вариант в каждом событии и все платные подсказки (кофе не считается).'
);

let failed = 0;
let warned = 0;
for (const file of files) {
  console.log(`\n${path.basename(file.path)}`);
  for (const lesson of file.lessons) {
    const result = checkLesson(lesson);
    const name = `${result.id} «${result.title}»`;
    if (result.shortages.length === 0) {
      console.log(`✓ ${name}: зарплата ${result.price} C, траты до ${result.worstCost} C`);
    } else {
      failed += 1;
      console.log(`✗ ${name}: зарплата ${result.price} C — в худшем случае не хватает денег`);
      result.costs.forEach((cost, index) => {
        if (cost.total > 0) {
          console.log(
            `    этап ${index + 2}: события ${cost.events} C + подсказки ${cost.hints} C = ${cost.total} C`
          );
        }
      });
      for (const s of result.shortages) {
        const from =
          s.stagesDone === 0 ? 'с начала' : `после ${s.stagesDone}-го этапа из ${s.stagesTotal}`;
        console.log(
          `    ${s.demo ? 'демо, ' : ''}смена ${from}: бюджет ${s.budget} C, траты ${s.cost} C (не хватает ${s.cost - s.budget} C)`
        );
      }
      console.log(
        `    → нужен price ≥ ${result.requiredPrice} (lessons:fix поставит ${result.fixedPrice})`
      );
    }
    for (const warning of result.warnings) {
      warned += 1;
      console.log(`  ⚠ ${warning}`);
    }
  }
}

const missing = missingWords(lessons, words);
if (missing.length > 0) console.log('');
for (const { id, word } of missing) {
  warned += 1;
  console.log(
    `  ⚠ урок ${id}: слова «${word}» нет в five_letters_words.json — игра загадает случайное слово темы`
  );
}

console.log(`\nУроков: ${lessons.length}, не хватает денег: ${failed}, предупреждений: ${warned}.`);
if (failed > 0) {
  console.log('Исправить: npm run lessons:fix (поднимет price у этих уроков).');
  process.exitCode = 1;
}
