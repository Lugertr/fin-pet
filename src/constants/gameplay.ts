// constants/gameplay.ts
// Игровые константы, не связанные с цветом/темой (см. @/theme для оформления).

// Настройка API
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const API_TIMEOUT = 10000;

// §6.2 ТЗ — стоимость действий в энергии (уроки и покупки бесплатны)
export const ARCADE_ENERGY_COST = 10;
/**
 * Монет за верный ответ в Аркаде. Было 10 (§10.2), снижено до 2 (решение
 * пользователя 27.09.2026): иначе полная энергия в Аркаде давала до 1000 C за
 * 8 часов и улучшения мебели (от 750 C) покупались без банка. Сейчас одна
 * игра даёт максимум 20 C за 10⚡ — 2 C за 1⚡ (еда стоит от 10 C за 1⚡).
 */
export const ARCADE_COINS_PER_CORRECT = 2;
export const AI_QUESTION_ENERGY_COST = 5; // §16.2 — до 2⚡ с предметом «Облако» (ai_cost_reduction)

// Настроение/энергия
export const MOOD_MAX = 100;
export const MOOD_BONUS_THRESHOLD = 50;
