// data/content/lessonFiles.test.ts
// Уроки — по файлу на тему в content/lessons (решение пользователя
// 29.09.2026). Metro не читает папку сам, файлы перечислены в lessonFiles.ts —
// тест ловит забытый файл, урок не в своём файле и повтор темы или id урока.

import branchesJson from '../../../content/branches.json';
import { ALL_LESSONS, LESSON_FILES } from './lessonFiles';

// В tsconfig нет типов Node (@types/node не нужен приложению) — как в
// ScreenHelp.test.ts, описываем нужные функции fs/path здесь.
declare const __dirname: string;
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs') as { readdirSync(dir: string): string[] };
const path = require('path') as { join(...parts: string[]): string };
/* eslint-enable @typescript-eslint/no-require-imports */

const LESSONS_DIR = path.join(__dirname, '../../../content/lessons');

describe('content/lessons — файл на тему', () => {
  it('подключены все файлы папки, и только они', () => {
    const onDisk = fs
      .readdirSync(LESSONS_DIR)
      .filter((name) => name.endsWith('.json'))
      .sort();
    expect(LESSON_FILES.map((f) => f.file).sort()).toEqual(onDisk);
  });

  it('у каждой темы один файл, и такая тема есть в branches.json', () => {
    const branchIds = new Set(branchesJson.map((b) => b.id));
    const fileBranches = LESSON_FILES.map((f) => f.branchId);
    expect(new Set(fileBranches).size).toBe(fileBranches.length);
    for (const id of fileBranches) expect(branchIds.has(id)).toBe(true);
  });

  it('в файле — только уроки его темы', () => {
    for (const file of LESSON_FILES) {
      const strangers = file.lessons.filter((l) => l.branch_id !== file.branchId).map((l) => l.id);
      expect({ file: file.file, strangers }).toEqual({ file: file.file, strangers: [] });
    }
  });

  it('id уроков не повторяются между файлами', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
