// domain/content/ScreenHelp.test.ts
// Подсказки «?» (решение пользователя 27.09.2026): у каждого экрана детского
// приложения — кнопка с объяснением. Проверяем и контент, и что каждый экран
// (маршрут в src/app) действительно показывает кнопку.

import screenHelpJson from '../../../content/screen_help.json';
import { SCREEN_HELP_IDS, ScreenHelpContent } from './ReferenceContent';

// В tsconfig нет типов Node (@types/node не нужен приложению) — тесту хватает
// трёх функций fs/path, описываем их здесь, а не тянем зависимость.
declare const __dirname: string;
interface DirEntry {
  name: string;
  isDirectory(): boolean;
}
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs') as {
  readdirSync(dir: string, options: { withFileTypes: true }): DirEntry[];
  readFileSync(file: string, encoding: 'utf8'): string;
};
const path = require('path') as {
  resolve(...parts: string[]): string;
  join(...parts: string[]): string;
};
/* eslint-enable @typescript-eslint/no-require-imports */

const SCREEN_HELP = screenHelpJson as ScreenHelpContent[];
const SRC = path.resolve(__dirname, '../..');

describe('content/screen_help.json', () => {
  it('у каждого экрана из SCREEN_HELP_IDS есть подсказка, лишних нет', () => {
    const ids = SCREEN_HELP.map((h) => h.id).sort();
    expect(ids).toEqual([...SCREEN_HELP_IDS].sort());
  });

  it('заголовок и 2–6 непустых пунктов с эмодзи; валюта — «C», без ⭐ и ₽', () => {
    for (const help of SCREEN_HELP) {
      expect(help.title.trim()).not.toBe('');
      expect(help.items.length).toBeGreaterThanOrEqual(2);
      expect(help.items.length).toBeLessThanOrEqual(6);
      for (const item of help.items) {
        expect(item.emoji.trim()).not.toBe('');
        expect(item.text.trim()).not.toBe('');
        expect(item.text).not.toMatch(/[⭐₽]/);
      }
    }
  });
});

/**
 * Маршрут → файл, в котором реально рисуется шапка с «?» (для экранов,
 * которые собирают шапку из компонентов).
 */
const HELP_RENDERED_IN: Record<string, string[]> = {
  '(tabs)/index.tsx': ['components/hub/HubHeader/HubHeader.tsx'],
  '(modal)/adventure.tsx': ['components/adventure/AdventureActiveView/AdventureActiveView.tsx'],
  '(modal)/lesson/[id].tsx': ['components/lesson/LessonStepHeader/LessonStepHeader.tsx'],
};

/** Не экраны: раскладки и стартовый редирект. */
const NOT_SCREENS = ['_layout.tsx', 'index.tsx'];

function listRoutes(dir: string, prefix = ''): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listRoutes(path.join(dir, entry.name), rel);
    if (!entry.name.endsWith('.tsx')) return [];
    if (NOT_SCREENS.includes(rel) || entry.name === '_layout.tsx') return [];
    return [rel];
  });
}

describe('каждый экран показывает кнопку подсказки', () => {
  const routes = listRoutes(path.join(SRC, 'app'));

  it.each(routes)('%s', (route) => {
    const files = HELP_RENDERED_IN[route] ?? [`app/${route}`];
    for (const file of files) {
      const source = fs.readFileSync(path.join(SRC, file), 'utf8');
      expect(source).toMatch(/help="[a-z_]+"|<HelpButton screen=["{]/);
    }
  });
});
