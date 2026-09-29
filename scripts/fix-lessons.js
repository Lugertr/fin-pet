// scripts/fix-lessons.js
// Исправление уроков (content/lessons — файл на тему): у уроков, где в худшем
// случае (самый дорогой вариант в каждом событии и все платные подсказки, без
// кофе) не хватает зарплаты смены, поднимает price — до наименьшей подходящей
// цены, округлённой вверх до 10. Задания, события и цены подсказок не
// меняются, цены только растут. Правила — scripts/lib/lessonsBudget.js.
//
// Запуск: npm run lessons:fix [-- --dry-run] [-- путь/к/папке/или/файлу.json]
// --dry-run — только показать, что изменится. Переписываются только файлы с
// исправлениями, формат каждого сохраняется: если он записан как
// JSON.stringify(…, null, 2), так и остаётся, иначе — prettier.

const fs = require('fs');
const path = require('path');
const { checkLesson, withPrice } = require('./lib/lessonsBudget');
const { ROOT, DEFAULT_LESSONS_PATH, readLessonFiles } = require('./lib/lessonFiles');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const target = args.find((a) => !a.startsWith('--')) || DEFAULT_LESSONS_PATH;

/** Текст файла с исправленными уроками — в формате исходного. */
async function formatLike(file, fixed) {
  const trailingNewline = file.original.endsWith('\n') ? '\n' : '';
  const stringifyStyle = JSON.stringify(file.lessons, null, 2) + trailingNewline;
  const output = JSON.stringify(fixed, null, 2) + trailingNewline;
  if (file.original.replace(/\r\n/g, '\n') === stringifyStyle) return output;
  // Файл отформатирован prettier — так и оставляем, чтобы в diff были только цены.
  const prettier = require('prettier');
  const options = (await prettier.resolveConfig(file.path)) || {};
  return prettier.format(output, { ...options, parser: 'json' });
}

async function main() {
  const files = readLessonFiles(target);
  const updates = [];

  for (const file of files) {
    const changes = [];
    const fixed = file.lessons.map((lesson) => {
      const result = checkLesson(lesson);
      if (result.fixedPrice === null) return lesson;
      changes.push({
        id: lesson.id,
        title: lesson.title,
        from: result.price,
        to: result.fixedPrice,
      });
      return withPrice(lesson, result.fixedPrice);
    });

    // Контрольная проверка: после исправления денег хватает везде.
    const stillFailing = fixed.filter((lesson) => checkLesson(lesson).shortages.length > 0);
    if (stillFailing.length > 0) {
      throw new Error(`не удалось исправить: ${stillFailing.map((l) => l.id).join(', ')}`);
    }
    if (changes.length > 0) updates.push({ file, fixed, changes });
  }

  if (updates.length === 0) {
    console.log('Денег хватает во всех уроках — исправлять нечего.');
    return;
  }
  for (const { file, changes } of updates) {
    console.log(path.basename(file.path));
    for (const c of changes) {
      console.log(`  ${c.id} «${c.title}»: price ${c.from} → ${c.to}`);
    }
  }
  const total = updates.reduce((sum, u) => sum + u.changes.length, 0);
  if (dryRun) {
    console.log(`\n--dry-run: файлы не изменены (уроков к исправлению: ${total}).`);
    return;
  }

  for (const { file, fixed } of updates) {
    fs.writeFileSync(file.path, await formatLike(file, fixed), 'utf8');
  }
  console.log(
    `\nОбновлено уроков: ${total} → ${updates.map((u) => path.relative(ROOT, u.file.path)).join(', ')}`
  );
}

main().catch((error) => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
