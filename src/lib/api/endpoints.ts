// lib/api/endpoints.ts
// Все эндпоинты бэкенда «ФинСпутник»

export const ENDPOINTS = {
  // Аутентификация и пользователь
  auth: {
    onboarding: '/auth/onboarding',
    login: '/auth/login',
    logout: '/auth/logout',
  },

  // Пользователь
  user: {
    profile: '/users/me',
    updateProfile: '/users/me',
    transactions: '/users/me/transactions',
  },

  // Питомец и настроение
  pet: {
    current: '/pets/me',
    updateMood: '/pets/me/mood',
  },

  // Ветки компетенций
  branches: {
    list: '/branches',
    detail: (branchId: number) => `/branches/${branchId}`,
  },

  // Уроки
  lessons: {
    list: (branchId: number) => `/branches/${branchId}/lessons`,
    detail: (lessonId: number) => `/lessons/${lessonId}`,
    start: (lessonId: number) => `/lessons/${lessonId}/start`,
    submitAnswer: (lessonId: number) => `/lessons/${lessonId}/submit`,
    complete: (lessonId: number) => `/lessons/${lessonId}/complete`,
    progress: '/lessons/progress',
  },

  // Мини-игры
  minigames: {
    config: (gameType: string) => `/minigames/${gameType}/config`,
  },

  // Аркада (повтор игр)
  arcade: {
    list: '/arcade',
    play: (lessonId: number) => `/arcade/${lessonId}/play`,
  },

  // Вклады
  deposits: {
    list: '/deposits',
    create: '/deposits',
    detail: (depositId: number) => `/deposits/${depositId}`,
    withdrawEarly: (depositId: number) => `/deposits/${depositId}/withdraw-early`,
    withdrawSuccess: (depositId: number) => `/deposits/${depositId}/withdraw-success`,
  },

  // Магазин и инвентарь
  shop: {
    items: '/shop/items',
    purchase: '/shop/purchase',
  },
  inventory: {
    list: '/inventory',
  },

  // ИИ-Наставник
  ai: {
    chat: '/ai/chat',
    context: '/ai/context',
  },

  // Дейлики и стрики
  daily: {
    bonus: '/daily/bonus',
    streak: '/daily/streak',
  },

  // Аналитика
  analytics: {
    spiderChart: '/analytics/spider-chart',
    netWorth: '/analytics/net-worth',
  },
} as const;
