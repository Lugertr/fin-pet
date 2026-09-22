// types/models.ts
// Доменные модели «Финни» — синхронизированы с бэкендом

/**
 * Пользователь
 */
export interface User {
  id: string; // UUID
  username: string;
  liquid_balance: number; // только int!
  created_at: string; // ISO datetime
  /** §18 — демо-режим: задания доступны сразу все, без ожидания периодов. */
  is_demo: boolean;
}

/**
 * Питомец (механика настроения)
 */
export interface Pet {
  id: number;
  user_id: string;
  mood: number; // 0-100
  last_mood_updated_at: string; // ISO datetime
  base_recovery_rate: number; // +5 в час по умолчанию
}

/**
 * Ветка компетенций (7 направлений)
 */
export interface Branch {
  id: number;
  name: string;
  description: string | null;
}

/**
 * Урок (комикс + мини-игра + тест)
 */
export interface Lesson {
  id: number;
  branch_id: number;
  title: string;
  order_index: number;
  minigame_type: MinigameType;
}

/**
 * Типы мини-игр (расширяемо через MinigameRegistry на бэкенде)
 */
export type MinigameType = 'quiz' | 'tinder_swipe' | string;

/**
 * Предмет в магазине
 */
export interface Item {
  id: number;
  name: string;
  item_type: ItemType;
  price: number; // int
  mood_recovery_buff: number; // бонус к восстановлению настроения
}

export type ItemType = 'decor' | 'food' | 'buff' | 'skin' | string;

/**
 * Инвентарь пользователя
 */
export interface InventoryEntry {
  id: number;
  user_id: string;
  item_id: number;
  quantity: number;
  item?: Item; // для eager loading
}

/**
 * Транзакция (леджер экономики)
 */
export interface Transaction {
  id: number;
  user_id: string;
  amount: number; // int, может быть отрицательным
  transaction_type: TransactionType;
  description: string | null;
  created_at: string; // ISO datetime
}

export type TransactionType =
  | 'lesson_reward'
  | 'lesson_completion'
  | 'minigame_reward'
  | 'purchase'
  | 'deposit_creation'
  | 'deposit_completion'
  | 'daily_bonus'
  | string;

/**
 * Вклад (механика накоплений)
 */
export interface Deposit {
  id: number;
  user_id: string;
  principal: number; // тело вклада
  daily_rate_percent: number; // например, 2 для 2%
  start_date: string; // ISO datetime
  status: DepositStatus;
}

export type DepositStatus = 'active' | 'closed';

/**
 * Прогресс пользователя по уроку
 */
export interface LessonProgress {
  id: number;
  user_id: string;
  lesson_id: number;
  status: LessonStatus;
  minigame_score: number | null;
  test_score: number | null;
  completed_at: string | null;
  is_arcade_available: boolean;
}

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Вопрос для мини-игр и тестов
 */
export interface Question {
  id: number;
  lesson_id: number;
  question_text: string;
  options: string[]; // JSON array
  correct_answer: string;
  question_type: 'minigame' | 'test';
}
