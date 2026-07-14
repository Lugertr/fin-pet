import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { mockAchievements, mockQuests } from '@/shared/config/mockData';

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
  isDev: false,
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
    set({
      pet: null,
      finances: { coins: 50, savings: 0, totalEarned: 0, totalSpent: 0, totalSaved: 0 },
      inventory: [],
      dailyQuests: mockQuests,
      piggyBank: {
        balance: 0,
        interestRate: 0.05,
        lastInterestCalculatedAt: new Date().toISOString(),
      },
      achievements: mockAchievements,
      stats: {
        totalQuestsCompleted: 0,
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        totalItemsBought: 0,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
      chatMessages: [
        {
          id: '1',
          role: 'system' as const,
          content:
            'Привет! Я твой финансовый помощник. Спрашивай меня о деньгах, копилках и покупках!',
          timestamp: new Date().toISOString(),
        },
      ],
      transactions: [
        {
          id: 'tx_initial',
          date: new Date().toISOString(),
          type: 'reward' as const,
          amount: 50,
          description: 'Стартовый бонус',
        },
      ],
      settings: { ...initialSettings, isDev: get().settings.isDev },
      isOnboarded: false,
      lastRewardAnimation: null,
      activeAdventure: null,
    });
  },
});
