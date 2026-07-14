import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';

export interface SettingsSlice {
  settings: import('@/entities/settings').AppSettings;
  updateSettings: (settings: Partial<import('@/entities/settings').AppSettings>) => void;
  resetGame: () => void;
}

const initialSettings: import('@/entities/settings').AppSettings = {
  notifications: {
    quests: true,
    petHungry: true,
    motivation: true,
  },
  reminderTime: '18:00',
  soundEnabled: true,
};

export const createSettingsSlice: StateCreator<GameStore, [], [], SettingsSlice> = (set, get) => ({
  settings: initialSettings,

  updateSettings: (newSettings) => {
    set({
      settings: {
        ...get().settings,
        ...newSettings,
      },
    });
  },

  resetGame: () => {
    // Import initial state from a constants file to avoid circular deps
    const initialState = {
      pet: null,
      finances: { coins: 50, savings: 0, totalEarned: 0, totalSpent: 0, totalSaved: 0 },
      inventory: [],
      dailyQuests: get().dailyQuests,
      piggyBank: {
        balance: 0,
        interestRate: 0.05,
        lastInterestCalculatedAt: new Date().toISOString(),
      },
      achievements: get().achievements,
      stats: {
        totalQuestsCompleted: 0,
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        totalItemsBought: 0,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
      chatMessages: get().chatMessages,
      transactions: [
        {
          id: 'tx_initial',
          date: new Date().toISOString(),
          type: 'reward' as const,
          amount: 50,
          description: 'Стартовый бонус',
        },
      ],
      settings: initialSettings,
      isOnboarded: false,
      lastRewardAnimation: null,
      activeAdventure: null,
    };
    set(initialState);
  },
});
