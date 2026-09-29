// scripts/lib/lessonFiles.js
// Где лежат уроки для скриптов lessons:check / lessons:fix: по файлу на тему в
// content/lessons (решение пользователя 29.09.2026). Скрипту можно передать
// папку (все *.json в ней по имени) или один файл.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DEFAULT_LESSONS_PATH = path.join(ROOT, 'content', 'lessons');

/** Пути к файлам уроков: папка — все её *.json по имени, файл — он сам. */
function lessonFilePaths(target = DEFAULT_LESSONS_PATH) {
  const resolved = path.resolve(target);
  if (!fs.statSync(resolved).isDirectory()) return [resolved];
  return fs
    .readdirSync(resolved)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => path.join(resolved, name));
}

/** Файлы уроков с исходным текстом (для записи в том же формате) и уроками. */
function readLessonFiles(target = DEFAULT_LESSONS_PATH) {
  return lessonFilePaths(target).map((filePath) => {
    const original = fs.readFileSync(filePath, 'utf8');
    return { path: filePath, original, lessons: JSON.parse(original) };
  });
}

module.exports = { ROOT, DEFAULT_LESSONS_PATH, lessonFilePaths, readLessonFiles };
