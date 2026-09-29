// Типы для scripts/lib/lessonsBudget.js — чтобы тест-сверка с приложением
// (src/domain/lesson/lessonsBudgetScript.test.ts) импортировал его из TypeScript.

import type { FiveLettersWordContent, LessonContent } from '@/domain/content/LessonContent';

export interface NodeCosts {
  events: number;
  hints: number;
  total: number;
}

export interface Shortage {
  demo: boolean;
  stagesDone: number;
  stagesTotal: number;
  budget: number;
  cost: number;
}

export interface LessonBudgetCheck {
  id: number;
  title: string;
  price: number;
  worstCost: number;
  costs: NodeCosts[];
  shortages: Shortage[];
  requiredPrice: number | null;
  fixedPrice: number | null;
  warnings: string[];
}

export const DEFAULT_LESSON_PRICE: number;
export const DEFAULT_HINT_PRICE: number;
export const DEMO_NODES: number;
export const PRICE_STEP: number;
export function hintPriceOf(activity: unknown): number;
export function paidHintCount(activity: unknown): number;
export function eventMaxSpend(activity: unknown): number;
export function nodeCosts(node: unknown): NodeCosts;
export function stageSalary(price: number, stagesDone: number, stagesTotal: number): number;
export function stagesTotal(nodeCount: number): number;
export function minPriceFor(cost: number, stagesDone: number, total: number): number;
export function checkLesson(lesson: LessonContent): LessonBudgetCheck;
export function missingWords(
  lessons: LessonContent[],
  bank: FiveLettersWordContent[]
): { id: number; word: string }[];
export function withPrice(lesson: LessonContent, price: number): LessonContent;
