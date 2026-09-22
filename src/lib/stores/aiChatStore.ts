// lib/stores/aiChatStore.ts
// История чата с ИИ-помощником (§16.2/§16.5 ТЗ): хранится вся, локально;
// очистка доступна пользователю. Реальное списание энергии за вопрос —
// 5⚡, 2⚡ с предметом «Облако» (§16.2, §12.2, getAiCostReduction из Этапа 5).

import { AI_QUESTION_ENERGY_COST } from '@/constants/gameplay';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { getAiAssistant } from '@/lib/ai';
import { canAffordEnergy } from '@/lib/utils/moodCalculator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShopStore } from '../hooks/useShop';
import { usePetStore } from './petStore';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedLessonId: number | null;
  createdAt: string;
}

interface AskResult {
  success: boolean;
  message?: string; // причина отказа — показать пользователю
}

interface AiChatState {
  messages: AiChatMessage[];
  isAsking: boolean;

  /** §16.2: 5⚡ по умолчанию, минус ai_cost_reduction купленных предметов («Облако» → 2⚡). */
  getEnergyCost: () => number;
  ask: (question: string) => Promise<AskResult>;
  /** §16.2/§16.5 — очистка истории доступна пользователю. */
  clearHistory: () => void;
}

export const useAiChatStore = create<AiChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isAsking: false,

      getEnergyCost: () => {
        const reduction = useShopStore.getState().getAiCostReduction();
        return Math.max(1, AI_QUESTION_ENERGY_COST - reduction);
      },

      ask: async (question) => {
        if (!FEATURE_FLAGS.ai_assistant_local) {
          return { success: false, message: 'ИИ-помощник временно недоступен' };
        }

        const trimmed = question.trim();
        if (!trimmed) return { success: false, message: 'Введите вопрос' };

        const cost = get().getEnergyCost();
        // Энергия могла восстановиться со времени последнего refreshMood() — сверяемся со свежим значением
        usePetStore.getState().refreshMood();
        const { currentMood } = usePetStore.getState();
        if (!canAffordEnergy(currentMood, cost)) {
          return {
            success: false,
            message: `Не хватает энергии (нужно ${cost}⚡). Покормите питомца или подождите восстановления.`,
          };
        }

        const userMessage: AiChatMessage = {
          id: `${Date.now()}-u`,
          role: 'user',
          content: trimmed,
          relatedLessonId: null,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...get().messages, userMessage], isAsking: true });

        try {
          const answer = await getAiAssistant().ask(trimmed);
          usePetStore.getState().spendEnergy(cost);

          const assistantMessage: AiChatMessage = {
            id: `${Date.now()}-a`,
            role: 'assistant',
            content: answer.text,
            relatedLessonId: answer.relatedLessonId,
            createdAt: new Date().toISOString(),
          };
          set({ messages: [...get().messages, assistantMessage], isAsking: false });
          return { success: true };
        } catch (error) {
          console.error('[AiChat] Не удалось получить ответ:', error);
          set({ isAsking: false });
          return { success: false, message: 'Не удалось получить ответ. Попробуйте ещё раз.' };
        }
      },

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'finsputnik-ai-chat-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
