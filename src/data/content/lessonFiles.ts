// data/content/lessonFiles.ts
// Уроки лежат по файлу на тему (решение пользователя 29.09.2026):
// content/lessons/<id темы>_<тема>.json — массив уроков одной темы, формат
// урока тот же (README, «Формат урока»). Metro не умеет подключать папку
// целиком, поэтому файлы перечислены здесь: новая тема — новый файл и строка
// ниже. Тест (lessonFiles.test.ts) проверяет, что перечислены все файлы папки
// и в каждом — уроки только своей темы.

import { LessonContent } from '@/domain/content/LessonContent';
import budget from '../../../content/lessons/1_budget.json';
import safety from '../../../content/lessons/2_safety.json';
import savings from '../../../content/lessons/3_savings.json';
import purchases from '../../../content/lessons/4_purchases.json';
import debts from '../../../content/lessons/5_debts.json';
import earnings from '../../../content/lessons/6_earnings.json';
import prices from '../../../content/lessons/7_prices.json';

export interface LessonFile {
  /** Имя файла в content/lessons. */
  file: string;
  /** Тема (branches.json) — у всех уроков файла такой branch_id. */
  branchId: number;
  lessons: LessonContent[];
}

export const LESSON_FILES: LessonFile[] = [
  { file: '1_budget.json', branchId: 1, lessons: budget as unknown as LessonContent[] },
  { file: '2_safety.json', branchId: 2, lessons: safety as unknown as LessonContent[] },
  { file: '3_savings.json', branchId: 3, lessons: savings as unknown as LessonContent[] },
  { file: '4_purchases.json', branchId: 4, lessons: purchases as unknown as LessonContent[] },
  { file: '5_debts.json', branchId: 5, lessons: debts as unknown as LessonContent[] },
  { file: '6_earnings.json', branchId: 6, lessons: earnings as unknown as LessonContent[] },
  { file: '7_prices.json', branchId: 7, lessons: prices as unknown as LessonContent[] },
];

/** Все уроки — по темам, внутри темы — в порядке файла. */
export const ALL_LESSONS: LessonContent[] = LESSON_FILES.flatMap((file) => file.lessons);
