import {
    mockAchievements,
    mockAdventures,
    mockQuests,
    mockShopItems,
} from '@/shared/config/mockData';
import type { AppSettings, GameState, Pet, PetType, Transaction } from '@/shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function simpleHash(str: string): string {
  let hash = 0;
  const salt = 'fin-pet-2025';
  const strWithSalt = salt + str + salt;

  for (let i = 0; i < strWithSalt.length; i++) {
    const char = strWithSalt.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const positiveHash = Math.abs(hash);
  return positiveHash.toString(36).padStart(8, '0');
}

function createTransaction(
  type: Transaction['type'],
  amount: number,
  description: string,
  category?: string
): Transaction {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    type,
    amount,
    description,
    category,
  };
}

// ============================================================
// ACTIONS INTERFACE
// ============================================================

interface GameActions {
  // Питомец
  createPet: (type: PetType, name: string, color: string) => void;
  feedPet: (itemId: string) => void;
  playWithPet: (itemId: string) => void;
  equipAccessory: (itemId: string) => void;
  unequipAccessory: (itemId: string) => void;
  restoreEnergy: () => void;

  // Задания
  completeQuest: (questId: string, answer: string) => boolean;

  // Магазин
  buyItem: (itemId: string) => boolean;
  useItem: (itemId: string) => void;

  // Копилка
  saveCoins: (amount: number) => void;
  withdrawSavings: (amount: number) => void;

  // Чат
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;

  // Приключения
  startAdventure: (adventureId: string) => boolean;
  completeAdventure: () => number | null;

  // Настройки и PIN
  setParentPin: (pin: string) => void;
  removeParentPin: (pin: string) => boolean;
  verifyParentPin: (pin: string) => boolean;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Анимация наград
  clearRewardAnimation: () => void;

  // Утилиты
  resetGame: () => void;
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: GameState = {
  pet: null,
  finances: {
    coins: 50,
    savings: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalSaved: 0,
  },
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
      role: 'system',
      content: 'Привет! Я твой финансовый помощник. Спрашивай меня о деньгах, копилках и покупках!',
      timestamp: new Date().toISOString(),
    },
  ],
  transactions: [
    {
      id: 'tx_initial',
      date: new Date().toISOString(),
      type: 'reward',
      amount: 50,
      description: 'Стартовый бонус',
    },
  ],
  settings: {
    notifications: {
      quests: true,
      petHungry: true,
      motivation: true,
    },
    reminderTime: '18:00',
    soundEnabled: true,
  },
  isOnboarded: false,
  lastRewardAnimation: null,
  activeAdventure: null,
};

// ============================================================
// STORE
// ============================================================

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --------------------------------------------------------
      // ПИТОМЕЦ
      // --------------------------------------------------------

      createPet: (type, name, color) => {
        const pet: Pet = {
          id: `pet_${Date.now()}`,
          type,
          name,
          color,
          level: 1,
          experience: 0,
          stage: 1,
          hunger: 80,
          happiness: 80,
          energy: 100,
          accessories: [],
          roomDecorations: [],
          createdAt: new Date().toISOString(),
          lastFedAt: new Date().toISOString(),
          lastPlayedAt: new Date().toISOString(),
          lastStatusUpdateAt: new Date().toISOString(),
        };
        set({ pet, isOnboarded: true });
      },

      feedPet: (itemId) => {
        const state = get();
        if (!state.pet) return;

        const inventoryItem = state.inventory.find((i) => i.itemId === itemId);
        if (!inventoryItem || inventoryItem.quantity === 0) return;

        const shopItem = mockShopItems.find((i) => i.id === itemId);
        if (!shopItem || !shopItem.effect.hunger) return;

        const pet = state.pet;
        const newHunger = Math.min(100, pet.hunger + shopItem.effect.hunger);

        set({
          pet: {
            ...pet,
            hunger: newHunger,
            lastFedAt: new Date().toISOString(),
          },
          inventory: state.inventory
            .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        });
      },

      playWithPet: (itemId) => {
        const state = get();
        if (!state.pet) return;

        const inventoryItem = state.inventory.find((i) => i.itemId === itemId);
        if (!inventoryItem || inventoryItem.quantity === 0) return;

        const shopItem = mockShopItems.find((i) => i.id === itemId);
        if (!shopItem || !shopItem.effect.happiness) return;

        const pet = state.pet;
        const newHappiness = Math.min(100, pet.happiness + shopItem.effect.happiness);

        set({
          pet: {
            ...pet,
            happiness: newHappiness,
            lastPlayedAt: new Date().toISOString(),
          },
          inventory: state.inventory
            .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        });
      },

      equipAccessory: (itemId) => {
        const state = get();
        if (!state.pet) return;

        const pet = state.pet;
        const MAX_ACCESSORIES = 3;

        if (pet.accessories.length >= MAX_ACCESSORIES) {
          const newAccessories = [...pet.accessories.slice(1), itemId];
          set({ pet: { ...pet, accessories: newAccessories } });
        } else {
          set({
            pet: { ...pet, accessories: [...pet.accessories, itemId] },
          });
        }
      },

      unequipAccessory: (itemId) => {
        const state = get();
        if (!state.pet) return;

        const pet = state.pet;
        set({
          pet: {
            ...pet,
            accessories: pet.accessories.filter((id) => id !== itemId),
          },
        });
      },

      restoreEnergy: () => {
        const state = get();
        if (!state.pet) return;

        const now = new Date();
        const lastUpdate = new Date(state.pet.lastStatusUpdateAt);
        const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        if (hoursPassed < 1) return;

        const energyRestore = Math.floor(hoursPassed * 10);
        const hungerDecay = Math.floor(hoursPassed * 1);
        const happinessDecay = Math.floor(hoursPassed * 1);

        set({
          pet: {
            ...state.pet,
            energy: Math.min(100, state.pet.energy + energyRestore),
            hunger: Math.max(0, state.pet.hunger - hungerDecay),
            happiness: Math.max(0, state.pet.happiness - happinessDecay),
            lastStatusUpdateAt: now.toISOString(),
          },
        });
      },

      // --------------------------------------------------------
      // ЗАДАНИЯ
      // --------------------------------------------------------

      completeQuest: (questId, answer) => {
        const state = get();
        const quest = state.dailyQuests.find((q) => q.id === questId);
        if (!quest || quest.completed) return false;

        let isCorrect = true;
        if (quest.answerType !== 'open' && quest.correctAnswer) {
          isCorrect = answer.toLowerCase().trim() === quest.correctAnswer.toLowerCase().trim();
        }

        if (isCorrect) {
          const newCoins = state.finances.coins + quest.reward;
          const currentExperience = state.pet?.experience || 0;
          const newExperience = currentExperience + quest.experienceReward;
          const currentLevel = state.pet?.level || 1;
          const newLevel = Math.floor(newExperience / 100) + currentLevel;
          const leveledUp = newLevel > currentLevel;

          set({
            finances: {
              ...state.finances,
              coins: newCoins,
              totalEarned: state.finances.totalEarned + quest.reward,
            },
            pet: state.pet
              ? {
                  ...state.pet,
                  experience: newExperience % 100,
                  level: newLevel,
                  stage: Math.min(5, Math.floor((newLevel - 1) / 2) + 1),
                }
              : null,
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
              type: leveledUp ? 'level_up' : 'coins',
              value: leveledUp ? newLevel : quest.reward,
              timestamp: Date.now(),
            },
          });
        }

        return isCorrect;
      },

      // --------------------------------------------------------
      // МАГАЗИН
      // --------------------------------------------------------

      buyItem: (itemId) => {
        const state = get();
        const shopItem = mockShopItems.find((i) => i.id === itemId);
        if (!shopItem) return false;

        if (state.finances.coins < shopItem.price) return false;

        const existingItem = state.inventory.find((i) => i.itemId === itemId);
        const newInventory = existingItem
          ? state.inventory.map((i) =>
              i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [
              ...state.inventory,
              {
                itemId,
                quantity: 1,
                purchasedAt: new Date().toISOString(),
                equipped: false,
              },
            ];

        set({
          finances: {
            ...state.finances,
            coins: state.finances.coins - shopItem.price,
            totalSpent: state.finances.totalSpent + shopItem.price,
          },
          inventory: newInventory,
          stats: {
            ...state.stats,
            totalItemsBought: state.stats.totalItemsBought + 1,
          },
          transactions: [
            ...state.transactions,
            createTransaction(
              'spend',
              shopItem.price,
              `Покупка: ${shopItem.name}`,
              shopItem.category
            ),
          ],
        });

        return true;
      },

      useItem: (itemId) => {
        const state = get();
        const shopItem = mockShopItems.find((i) => i.id === itemId);
        if (!shopItem || !shopItem.consumable) return;

        if (shopItem.category === 'food') {
          get().feedPet(itemId);
        } else if (shopItem.category === 'toy') {
          get().playWithPet(itemId);
        }
      },

      // --------------------------------------------------------
      // КОПИЛКА
      // --------------------------------------------------------

      saveCoins: (amount) => {
        const state = get();
        if (state.finances.coins < amount) return;

        set({
          finances: {
            ...state.finances,
            coins: state.finances.coins - amount,
            savings: state.finances.savings + amount,
            totalSaved: state.finances.totalSaved + amount,
          },
          piggyBank: {
            ...state.piggyBank,
            balance: state.piggyBank.balance + amount,
          },
          transactions: [...state.transactions, createTransaction('save', amount, 'В копилку')],
        });
      },

      withdrawSavings: (amount) => {
        const state = get();
        if (state.finances.savings < amount) return;

        set({
          finances: {
            ...state.finances,
            coins: state.finances.coins + amount,
            savings: state.finances.savings - amount,
          },
          piggyBank: {
            ...state.piggyBank,
            balance: state.piggyBank.balance - amount,
          },
          transactions: [
            ...state.transactions,
            createTransaction('withdraw', amount, 'Из копилки'),
          ],
        });
      },

      // --------------------------------------------------------
      // ЧАТ
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // ПРИКЛЮЧЕНИЯ
      // --------------------------------------------------------

      startAdventure: (adventureId) => {
        const state = get();
        if (!state.pet) return false;
        if (state.activeAdventure) return false;

        const adventure = mockAdventures.find((a) => a.id === adventureId);
        if (!adventure) return false;

        if (state.pet.level < adventure.levelRequirement) return false;
        if (state.pet.energy < adventure.energyCost) return false;

        const now = new Date();
        const endsAt = new Date(now.getTime() + adventure.duration * 60 * 60 * 1000);

        set({
          pet: {
            ...state.pet,
            energy: state.pet.energy - adventure.energyCost,
          },
          activeAdventure: {
            adventureId,
            startedAt: now.toISOString(),
            endsAt: endsAt.toISOString(),
          },
        });

        return true;
      },

      completeAdventure: () => {
        const state = get();
        if (!state.activeAdventure) return null;

        const now = new Date();
        const endsAt = new Date(state.activeAdventure.endsAt);
        if (now < endsAt) return null;

        const adventure = mockAdventures.find((a) => a.id === state.activeAdventure!.adventureId);
        if (!adventure) return null;

        const reward =
          Math.floor(Math.random() * (adventure.maxReward - adventure.minReward + 1)) +
          adventure.minReward;

        set({
          finances: {
            ...state.finances,
            coins: state.finances.coins + reward,
            totalEarned: state.finances.totalEarned + reward,
          },
          pet: state.pet
            ? {
                ...state.pet,
                energy: Math.min(100, state.pet.energy + 10),
              }
            : null,
          activeAdventure: null,
          transactions: [
            ...state.transactions,
            createTransaction('earn', reward, `Приключение: ${adventure.name}`, adventure.category),
          ],
          lastRewardAnimation: {
            type: 'coins',
            value: reward,
            timestamp: Date.now(),
          },
        });

        return reward;
      },

      // --------------------------------------------------------
      // НАСТРОЙКИ И PIN
      // --------------------------------------------------------

      setParentPin: (pin) => {
        set({
          settings: {
            ...get().settings,
            parentPinHash: simpleHash(pin),
          },
        });
      },

      removeParentPin: (pin) => {
        const state = get();
        if (state.settings.parentPinHash === simpleHash(pin)) {
          set({
            settings: {
              ...state.settings,
              parentPinHash: undefined,
            },
          });
          return true;
        }
        return false;
      },

      verifyParentPin: (pin) => {
        const state = get();
        return state.settings.parentPinHash === simpleHash(pin);
      },

      updateSettings: (newSettings) => {
        set({
          settings: {
            ...get().settings,
            ...newSettings,
          },
        });
      },

      // --------------------------------------------------------
      // АНИМАЦИЯ НАГРАД
      // --------------------------------------------------------

      clearRewardAnimation: () => {
        set({ lastRewardAnimation: null });
      },

      // --------------------------------------------------------
      // УТИЛИТЫ
      // --------------------------------------------------------

      resetGame: () => {
        set(initialState);
      },
    }),
    {
      name: 'fin-pet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
