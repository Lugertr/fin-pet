import { mockAchievements, mockQuests } from '@/shared/config/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createPetSlice, PetSlice } from '@/entities/pet/model/slice';
import { createQuestSlice, QuestSlice } from '@/features/complete-quest/model/slice';
import { createShopSlice, ShopSlice } from '@/features/buy-item/model/slice';
import { createPiggyBankSlice, PiggyBankSlice } from '@/features/save-coins/model/slice';
import { createChatSlice, ChatSlice } from '@/features/chat-with-llm/model/slice';
import { createAdventureSlice, AdventureSlice } from '@/features/start-adventure/model/slice';
import { createParentModeSlice, ParentModeSlice } from '@/features/parent-mode/model/slice';
import { createSettingsSlice, SettingsSlice } from '@/features/settings/model/slice';
import { createDevSlice, DevSlice } from '@/features/dev-mode/model/slice';

import type { Finances, Stats } from '@/entities/wallet';
import type { InventoryItem } from '@/entities/inventory';
import type { Achievement } from '@/entities/achievement';
import type { Transaction } from '@/entities/transaction';
import type { RewardAnimation } from '@/shared/types';

export type GameStore = PetSlice &
  QuestSlice &
  ShopSlice &
  PiggyBankSlice &
  ChatSlice &
  AdventureSlice &
  ParentModeSlice &
  SettingsSlice &
  DevSlice & {
    finances: Finances;
    inventory: InventoryItem[];
    achievements: Achievement[];
    stats: Stats;
    transactions: Transaction[];
    lastRewardAnimation: {
      type: 'coins' | 'achievement' | 'level_up';
      value: number | string;
      timestamp: number;
    } | null;
  };

const initialState = {
  finances: {
    coins: 50,
    savings: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalSaved: 0,
  } as Finances,
  inventory: [] as InventoryItem[],
  achievements: mockAchievements as Achievement[],
  stats: {
    totalQuestsCompleted: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalItemsBought: 0,
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
  } as Stats,
  transactions: [
    {
      id: 'tx_initial',
      date: new Date().toISOString(),
      type: 'reward' as const,
      amount: 50,
      description: 'Стартовый бонус',
    },
  ] as Transaction[],
  lastRewardAnimation: null as RewardAnimation | null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...initialState,
      ...createPetSlice(...a),
      ...createQuestSlice(...a),
      ...createShopSlice(...a),
      ...createPiggyBankSlice(...a),
      ...createChatSlice(...a),
      ...createAdventureSlice(...a),
      ...createParentModeSlice(...a),
      ...createSettingsSlice(...a),
      ...createDevSlice(...a),
    }),
    {
      name: 'fin-pet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
