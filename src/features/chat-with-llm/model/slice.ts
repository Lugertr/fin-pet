import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { INITIAL_CHAT_MESSAGE } from '@/entities/chat';

export const mockResponses: Record<string, string> = {
  инфляция:
    'Инфляция — это когда деньги со временем покупают меньше вещей. Представь: шоколадка стоила 50₽, а теперь стоит 60₽. Вот это и есть инфляция! 🍫',
  копить:
    'Копить — это откладывать часть денег на будущее. Как белка запасает орешки на зиму 🐿️. Чем больше отложишь сейчас, тем больше будет потом!',
  бюджет:
    'Бюджет — это план, как тратить деньги. Раздели свои монеты на 3 части: нужное (еда), желаемое (игрушки) и сбережения (копилка) 💰',
  инвестиции:
    'Инвестиции — это когда ты даёшь свои деньги в дело, чтобы они приносили ещё больше денег. Как посадить семечко 🌱 — оно вырастает и даёт плоды!',
  default:
    'Интересный вопрос! Давай разберёмся вместе. Расскажи подробнее, что именно тебя интересует? 💭',
};

export function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response;
    }
  }
  return mockResponses.default;
}

export interface ChatSlice {
  chatMessages: import('@/entities/chat').ChatMessage[];
  addChatMessage: (role: 'user' | 'assistant' | 'system', content: string) => void;
}

export const createChatSlice: StateCreator<GameStore, [], [], ChatSlice> = (set, get) => ({
  chatMessages: [INITIAL_CHAT_MESSAGE],

  addChatMessage: (role, content) => {
    const state = get();
    const newMessage = {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    set({ chatMessages: [...state.chatMessages, newMessage] });
  },
});
