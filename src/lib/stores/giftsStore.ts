// src/lib/stores/giftsStore.ts
// Store для подарков (бывшие лутбоксы) — за прохождение тем

import { GiftRarity } from '@/types/gifts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShop } from '../hooks/useShop';
import { useUserStore } from './userStore';

// ============================================
// ЭКСПОРТИРУЕМЫЕ ТИПЫ
// ============================================

/**
 * Подарок — может быть неоткрыт или открыт
 */
export interface Gift {
  id: string;
  branchId: number; // ID ветки, за которую получен
  themeName: string; // Название темы
  rarity: GiftRarity; // Редкость: common | rare | epic | legendary
  isOpened: boolean;
  createdAt: string;
  openedAt?: string;
  // Содержимое (заполняется при открытии)
  itemIcon?: string;
  itemName?: string;
  itemId?: number;
  coins?: number;
}

/**
 * Запись в истории открытых подарков
 */
export interface GiftHistoryEntry {
  giftId: string;
  branchId: number;
  themeName: string;
  rarity: GiftRarity;
  itemIcon: string;
  itemName: string;
  itemId: number;
  coins: number;
  openedAt: string;
}

// ============================================
// БАЗОВЫЙ ПУЛ ПРЕДМЕТОВ ПО РЕДКОСТЯМ
// ============================================

const GIFT_POOLS: Record<GiftRarity, Array<{ id: number; name: string; icon: string }>> = {
  common: [
    { id: 1, name: 'Растение', icon: '🪴' },
    { id: 2, name: 'Лампа', icon: '💡' },
    { id: 3, name: 'Ковёр', icon: '🟫' },
    { id: 4, name: 'Подушка', icon: '🛋️' },
  ],
  rare: [
    { id: 5, name: 'Книжный шкаф', icon: '📚' },
    { id: 6, name: 'Аквариум', icon: '🐠' },
    { id: 7, name: 'Торшер', icon: '🪔' },
  ],
  epic: [
    { id: 8, name: 'Геймерское кресло', icon: '🪑' },
    { id: 9, name: 'Игровая консоль', icon: '🎮' },
  ],
  legendary: [
    { id: 10, name: 'Золотой трофей', icon: '🏆' },
    { id: 11, name: 'Драгоценный камень', icon: '💎' },
  ],
};

/**
 * Выбрать предмет по редкости с учётом вероятностей
 */
function rollItem(rarity: GiftRarity) {
  const pool = GIFT_POOLS[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Выбрать редкость подарка с вероятностями
 * common: 70%, rare: 20%, epic: 8%, legendary: 2%
 */
function rollRarity(): GiftRarity {
  const rand = Math.random() * 100;
  if (rand < 70) return 'common';
  if (rand < 90) return 'rare';
  if (rand < 98) return 'epic';
  return 'legendary';
}

/**
 * Количество монет в зависимости от редкости
 */
function getCoinsForRarity(rarity: GiftRarity): number {
  switch (rarity) {
    case 'common':
      return 50;
    case 'rare':
      return 100;
    case 'epic':
      return 250;
    case 'legendary':
      return 500;
  }
}

// ============================================
// STORE
// ============================================

interface GiftsState {
  // Неоткрытые подарки
  pendingGifts: Gift[];
  // История открытых
  history: GiftHistoryEntry[];
  // Всего получено монет из подарков
  totalCoinsFromGifts: number;

  // Actions
  addGiftForTheme: (branchId: number, themeName: string) => Gift;
  hasUnopenedGiftForBranch: (branchId: number) => boolean;
  openGift: (giftId: string) => Gift | null;
  clearAll: () => void;
}

export const useGiftsStore = create<GiftsState>()(
  persist(
    (set, get) => ({
      pendingGifts: [],
      history: [],
      totalCoinsFromGifts: 0,

      /**
       * Создать подарок за прохождение темы
       */
      addGiftForTheme: (branchId, themeName) => {
        const rarity = rollRarity();
        const newGift: Gift = {
          id: uuidv4(),
          branchId,
          themeName,
          rarity,
          isOpened: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          pendingGifts: [...state.pendingGifts, newGift],
        }));

        return newGift;
      },

      /**
       * Проверить, есть ли неоткрытый подарок для ветки
       */
      hasUnopenedGiftForBranch: (branchId) => {
        return get().pendingGifts.some((g) => g.branchId === branchId && !g.isOpened);
      },

      /**
       * Открыть подарок и начислить содержимое
       */
      openGift: (giftId) => {
        const gift = get().pendingGifts.find((g) => g.id === giftId && !g.isOpened);
        if (!gift) return null;

        // Выбираем предмет по редкости
        const item = rollItem(gift.rarity);
        const coins = getCoinsForRarity(gift.rarity);

        // Заполняем подарок содержимым
        const openedGift: Gift = {
          ...gift,
          isOpened: true,
          openedAt: new Date().toISOString(),
          itemIcon: item.icon,
          itemName: item.name,
          itemId: item.id,
          coins,
        };

        // Добавляем в инвентарь через shop store
        try {
          const shopStore = useShop();
          // Если метод addItem существует — добавим предмет
          if (typeof (shopStore as any).addItem === 'function') {
            (shopStore as any).addItem(item.id);
          }
        } catch (error) {
          console.warn('[Gifts] Не удалось добавить предмет в инвентарь:', error);
        }

        // Начисляем монеты
        const { user } = useUserStore.getState();
        if (user) {
          useUserStore.getState().updateBalance(user.liquid_balance + coins);
        }

        // Запись в историю
        const historyEntry: GiftHistoryEntry = {
          giftId: gift.id,
          branchId: gift.branchId,
          themeName: gift.themeName,
          rarity: gift.rarity,
          itemIcon: item.icon,
          itemName: item.name,
          itemId: item.id,
          coins,
          openedAt: openedGift.openedAt!,
        };

        set((state) => ({
          pendingGifts: state.pendingGifts.filter((g) => g.id !== giftId),
          history: [historyEntry, ...state.history],
          totalCoinsFromGifts: state.totalCoinsFromGifts + coins,
        }));

        return openedGift;
      },

      /**
       * Очистить все подарки (для сброса)
       */
      clearAll: () => {
        set({
          pendingGifts: [],
          history: [],
          totalCoinsFromGifts: 0,
        });
      },
    }),
    {
      name: 'finsputnik-gifts-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useGifts() {
  return useGiftsStore();
}
