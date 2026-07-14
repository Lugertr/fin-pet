import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { mockShopItems, mockAdventures } from '@/shared/config/mockData';
import { createTransaction } from '@/entities/wallet';

export interface DevSlice {
  addCoins: (amount: number) => void;
  setCoins: (amount: number) => void;
  setPetLevel: (level: number) => void;
  setPetHunger: (value: number) => void;
  setPetHappiness: (value: number) => void;
  setPetEnergy: (value: number) => void;
  levelUpPet: () => void;
  maxPetStats: () => void;
  completeAllQuests: () => void;
  unlockAllAchievements: () => void;
  giveAllItems: () => void;
  startRandomAdventure: () => void;
  completeActiveAdventure: () => void;
  removeActiveAdventure: () => void;
}

export const createDevSlice: StateCreator<GameStore, [], [], DevSlice> = (set, get) => ({
  addCoins: (amount) => {
    const state = get();
    set({
      finances: {
        ...state.finances,
        coins: state.finances.coins + amount,
        totalEarned: state.finances.totalEarned + amount,
      },
      transactions: [
        ...state.transactions,
        createTransaction('reward', amount, `[DEV] +${amount} монет`),
      ],
    });
  },

  setCoins: (amount) => {
    set({ finances: { ...get().finances, coins: amount } });
  },

  setPetLevel: (level) => {
    const state = get();
    if (!state.pet) return;
    set({
      pet: {
        ...state.pet,
        level,
        experience: 0,
        stage: Math.min(5, Math.floor((level - 1) / 2) + 1),
      },
    });
  },

  setPetHunger: (value) => {
    const state = get();
    if (!state.pet) return;
    set({ pet: { ...state.pet, hunger: Math.max(0, Math.min(100, value)) } });
  },

  setPetHappiness: (value) => {
    const state = get();
    if (!state.pet) return;
    set({ pet: { ...state.pet, happiness: Math.max(0, Math.min(100, value)) } });
  },

  setPetEnergy: (value) => {
    const state = get();
    if (!state.pet) return;
    set({ pet: { ...state.pet, energy: Math.max(0, Math.min(100, value)) } });
  },

  levelUpPet: () => {
    const state = get();
    if (!state.pet) return;
    const pet = state.pet;
    set({
      pet: {
        ...pet,
        level: pet.level + 1,
        experience: 0,
        stage: Math.min(5, Math.floor(pet.level / 2) + 1),
      },
    });
  },

  maxPetStats: () => {
    const state = get();
    if (!state.pet) return;
    set({
      pet: {
        ...state.pet,
        hunger: 100,
        happiness: 100,
        energy: 100,
        lastStatusUpdateAt: new Date().toISOString(),
      },
    });
  },

  completeAllQuests: () => {
    const state = get();
    let totalReward = 0;
    let totalXp = 0;

    const updatedQuests = state.dailyQuests.map((q) => {
      if (q.completed) return q;
      totalReward += q.reward;
      totalXp += q.experienceReward;
      return {
        ...q,
        completed: true,
        completedAt: new Date().toISOString(),
        userAnswer: '[DEV]',
        isCorrect: true,
      };
    });

    const pet = state.pet;
    let petUpdates = {};
    if (pet) {
      const newExperience = pet.experience + totalXp;
      const newLevel = Math.floor(newExperience / 100) + pet.level;
      petUpdates = {
        experience: newExperience % 100,
        level: newLevel,
        stage: Math.min(5, Math.floor((newLevel - 1) / 2) + 1),
      };
    }

    set({
      dailyQuests: updatedQuests,
      finances: {
        ...state.finances,
        coins: state.finances.coins + totalReward,
        totalEarned: state.finances.totalEarned + totalReward,
      },
      pet: pet ? { ...pet, ...petUpdates } : null,
      stats: {
        ...state.stats,
        totalQuestsCompleted:
          state.stats.totalQuestsCompleted + updatedQuests.filter((q) => q.completed).length,
        totalCoinsEarned: state.stats.totalCoinsEarned + totalReward,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
      transactions: [
        ...state.transactions,
        createTransaction('reward', totalReward, '[DEV] Все задания выполнены'),
      ],
    });
  },

  unlockAllAchievements: () => {
    set({
      achievements: get().achievements.map((a) => ({
        ...a,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      })),
    });
  },

  giveAllItems: () => {
    const existing = [...get().inventory];

    mockShopItems.forEach((item) => {
      const found = existing.find((i) => i.itemId === item.id);
      if (found) {
        const idx = existing.findIndex((i) => i.itemId === item.id);
        existing[idx] = { ...found, quantity: found.quantity + 1 };
      } else {
        existing.push({
          itemId: item.id,
          quantity: 1,
          purchasedAt: new Date().toISOString(),
          equipped: false,
        });
      }
    });

    set({ inventory: existing });
  },

  startRandomAdventure: () => {
    const state = get();
    if (!state.pet || state.activeAdventure) return;

    const adventure = mockAdventures[Math.floor(Math.random() * mockAdventures.length)];
    const now = new Date();
    const endsAt = new Date(now.getTime() + 10 * 1000);

    set({
      activeAdventure: {
        adventureId: adventure.id,
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
      },
    });
  },

  completeActiveAdventure: () => {
    const state = get();
    if (!state.activeAdventure) return;

    const adventure = mockAdventures.find((a) => a.id === state.activeAdventure!.adventureId);
    if (!adventure) return;

    const reward =
      Math.floor(Math.random() * (adventure.maxReward - adventure.minReward + 1)) +
      adventure.minReward;

    set({
      finances: {
        ...state.finances,
        coins: state.finances.coins + reward,
        totalEarned: state.finances.totalEarned + reward,
      },
      pet: state.pet ? { ...state.pet, energy: Math.min(100, state.pet.energy + 10) } : null,
      activeAdventure: null,
      transactions: [
        ...state.transactions,
        createTransaction('earn', reward, `[DEV] Приключение: ${adventure.name}`),
      ],
    });
  },

  removeActiveAdventure: () => {
    set({ activeAdventure: null });
  },
});
