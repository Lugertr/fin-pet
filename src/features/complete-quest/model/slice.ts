import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { createTransaction } from '@/entities/wallet';
import { calculateLevelUp } from '@/entities/pet';
import { validateAnswer } from '../lib/validateAnswer';

export interface QuestSlice {
  dailyQuests: import('@/entities/quest').Quest[];
  completeQuest: (questId: string, answer: string) => boolean;
}

export const createQuestSlice: StateCreator<GameStore, [], [], QuestSlice> = (set, get) => ({
  dailyQuests: [],

  completeQuest: (questId, answer) => {
    const state = get();
    const quest = state.dailyQuests.find((q) => q.id === questId);
    if (!quest || quest.completed) return false;

    const isCorrect = validateAnswer(quest, answer);

    if (isCorrect) {
      const newCoins = state.finances.coins + quest.reward;
      const currentPet = state.pet;

      let petUpdates = {};
      if (currentPet) {
        const { level, stage, leveledUp } = calculateLevelUp(currentPet, quest.experienceReward);
        petUpdates = {
          experience: (currentPet.experience + quest.experienceReward) % 100,
          level,
          stage,
        };
      }

      set({
        finances: {
          ...state.finances,
          coins: newCoins,
          totalEarned: state.finances.totalEarned + quest.reward,
        },
        pet: currentPet ? { ...currentPet, ...petUpdates } : null,
        dailyQuests: state.dailyQuests.map((q) =>
          q.id === questId
            ? {
                ...q,
                completed: true,
                completedAt: new Date().toISOString(),
                userAnswer: answer,
                isCorrect: true,
              }
            : q
        ),
        stats: {
          ...state.stats,
          totalQuestsCompleted: state.stats.totalQuestsCompleted + 1,
          totalCoinsEarned: state.stats.totalCoinsEarned + quest.reward,
          lastActiveDate: new Date().toISOString().split('T')[0],
        },
        transactions: [
          ...state.transactions,
          createTransaction('earn', quest.reward, `Задание: ${quest.title}`, quest.category),
        ],
        lastRewardAnimation: {
          type: currentPet && currentPet.level > currentPet.level - 1 ? 'level_up' : 'coins',
          value:
            currentPet && currentPet.level > currentPet.level - 1 ? currentPet.level : quest.reward,
          timestamp: Date.now(),
        },
      });
    }

    return isCorrect;
  },
});
