// types/api.ts
// Типы для API запросов и ответов

import {
  Branch,
  Deposit,
  InventoryEntry,
  Item,
  Lesson,
  LessonProgress,
  Pet,
  Question,
  Transaction,
  User,
} from './models';

// ============ ОБЩИЕ ============

/**
 * Стандартный ответ с ошибкой
 */
export interface ApiErrorResponse {
  detail: string;
}

/**
 * Пагинация для списков
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// ============ ПОЛЬЗОВАТЕЛЬ ============

export interface UserResponse {
  user: User;
  pet: Pet | null;
  total_net_worth: number; // liquid_balance + стоимость инвентаря
}

export interface OnboardingRequest {
  username: string;
  pet_type: 'robot' | 'dragon' | 'cat';
  pet_name: string;
  priority_branches: number[]; // 2-3 приоритетные ветки
}

export interface OnboardingResponse {
  user: User;
  pet: Pet;
}

// ============ ПИТОМЕЦ / НАСТРОЕНИЕ ============

export interface PetResponse {
  pet: Pet;
  current_mood: number; // актуальное настроение (рассчитано на бэкенде)
  mood_buffs: number; // бонусы от декора
  hours_until_full: number; // часов до полного восстановления
}

export interface UpdateMoodRequest {
  penalty: number;
}

// ============ ВЕТКИ И УРОКИ ============

export interface BranchListResponse {
  branches: Branch[];
  recommended_branches: number[]; // ID веток с отметкой «Рекомендовано»
}

export interface LessonListResponse {
  lessons: Lesson[];
  progress: Record<number, LessonProgress>; // lesson_id -> progress
}

export interface StartLessonResponse {
  lesson: Lesson;
  questions: Question[];
  mood_before: number;
}

export interface SubmitAnswerRequest {
  user_answer: string;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  mood_change: number; // отрицательное если штраф
  coins_earned: number;
  new_mood: number;
  new_balance: number;
}

export interface CompleteLessonResponse {
  message: string;
  bonus_coins: number;
  new_balance: number;
}

// ============ МИНИ-ИГРЫ ============

/**
 * Конфиг для викторины
 */
export interface QuizMinigameConfig {
  type: 'quiz';
  options_count: number;
  time_limit_seconds?: number;
  points_per_correct: number;
}

/**
 * Конфиг для свайпов (Скам-Свайпер)
 */
export interface TinderSwipeMinigameConfig {
  type: 'tinder_swipe';
  scenarios_count: number;
  swipe_threshold?: number;
}

/**
 * Конфиг для симулятора бизнеса
 */
export interface StallSimulatorConfig {
  type: 'stall_simulator';
  rounds_count: number;
  starting_budget: number;
}

/**
 * Конфиг для чат-детектива
 */
export interface ChatDetectiveConfig {
  type: 'chat_detective';
  dialogs_count: number;
}

/**
 * Union-тип всех возможных конфигов мини-игр
 */
export type MinigameConfig =
  QuizMinigameConfig | TinderSwipeMinigameConfig | StallSimulatorConfig | ChatDetectiveConfig;

export interface MinigameConfigResponse {
  game_type: string;
  config: MinigameConfig;
}
// ============ ВКЛАДЫ ============

export interface CreateDepositRequest {
  principal: number;
  daily_rate_percent?: number; // по умолчанию 2
}

export interface DepositWithInterestResponse {
  deposit_id: number;
  principal: number;
  accrued_interest: number;
  total: number;
  days_passed: number;
  can_withdraw_successfully: boolean;
}

export interface DepositListResponse {
  deposits: Deposit[];
  active_deposits: number;
}

export interface WithdrawResponse {
  amount_returned: number;
  interest_earned: number;
  new_balance: number;
}

// ============ МАГАЗИН И ИНВЕНТАРЬ ============

export interface ShopItemResponse {
  item: Item;
  is_purchasable: boolean; // хватает ли денег
}

export interface PurchaseItemRequest {
  item_id: number;
  quantity?: number;
}

export interface PurchaseItemResponse {
  success: boolean;
  new_balance: number;
  item: Item;
}

export interface InventoryResponse {
  items: InventoryEntry[];
  total_value: number; // стоимость всего инвентаря
}

// ============ ТРАНЗАКЦИИ ============

export interface TransactionListResponse {
  transactions: Transaction[];
  total_count: number;
}

// ============ ИИ-НАСТАВНИК ============

export interface AIContext {
  balance: number;
  mood: number;
  active_deposits: number;
  completed_lessons: number;
  streak_days: number;
  total_net_worth: number;
  recommended_branches?: number[];
  [key: string]: string | number | boolean | number[] | undefined; // index signature для расширения
}

export interface AiChatRequest {
  message: string;
  context?: AIContext;
}

export interface AiChatResponse {
  response: string;
  questions_remaining: number; // сколько бесплатных вопросов осталось
  was_bonus_awarded: boolean; // бонус за первый вопрос дня
  bonus_amount: number;
}

// ============ ДЕЙЛИКИ ============

export interface DailyBonusResponse {
  streak_days: number; // текущая серия входов
  bonus_received: number;
  is_super_case_available: boolean; // супер-кейс на 7-й день
}

export interface SpiderChartData {
  branches: {
    id: number;
    name: string;
    score: number; // 0-100
  }[];
}
