// constants/gameplay.ts
// Игровые константы, не связанные с цветом/темой (см. @/theme для оформления).

// Настройка API
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const API_TIMEOUT = 10000;

// §6.2 ТЗ — стоимость действий в энергии (уроки и покупки бесплатны)
export const ARCADE_ENERGY_COST = 10;
export const AI_QUESTION_ENERGY_COST = 5; // §16.2 — до 2⚡ с предметом «Облако» (ai_cost_reduction)

// Настроение/энергия
export const MOOD_MAX = 100;
export const MOOD_BONUS_THRESHOLD = 50;
