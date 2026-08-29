// lib/hooks/useShop.ts
// Хук для управления магазином и покупками

import { useUserStore } from '@/lib/stores/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ShopItem {
  id: number;
  name: string;
  category: 'decor' | 'food' | 'buff' | 'skin';
  price: number;
  icon: string;
  description: string;
  mood_buff: number;
}

// Каталог товаров
export const SHOP_CATALOG: ShopItem[] = [
  // Декор
  {
    id: 1,
    name: 'Кровать',
    category: 'decor',
    price: 150,
    icon: '🛏️',
    description: '+2 к восстановлению настроения',
    mood_buff: 2,
  },
  {
    id: 2,
    name: 'Растение',
    category: 'decor',
    price: 80,
    icon: '🪴',
    description: '+1 к восстановлению настроения',
    mood_buff: 1,
  },
  {
    id: 3,
    name: 'Стол',
    category: 'decor',
    price: 120,
    icon: '🪑',
    description: '+1 к восстановлению настроения',
    mood_buff: 1,
  },
  {
    id: 4,
    name: 'Лампа',
    category: 'decor',
    price: 60,
    icon: '💡',
    description: '+1 к восстановлению настроения',
    mood_buff: 1,
  },
  {
    id: 5,
    name: 'Ковёр',
    category: 'decor',
    price: 100,
    icon: '🟫',
    description: '+1 к восстановлению настроения',
    mood_buff: 1,
  },

  // Еда
  {
    id: 6,
    name: 'Яблоко',
    category: 'food',
    price: 20,
    icon: '🍎',
    description: '+5 к настроению',
    mood_buff: 0,
  },
  {
    id: 7,
    name: 'Пицца',
    category: 'food',
    price: 50,
    icon: '🍕',
    description: '+15 к настроению',
    mood_buff: 0,
  },
  {
    id: 8,
    name: 'Торт',
    category: 'food',
    price: 80,
    icon: '🎂',
    description: '+25 к настроению',
    mood_buff: 0,
  },
  {
    id: 9,
    name: 'Кофе',
    category: 'food',
    price: 30,
    icon: '☕',
    description: '+10 к настроению',
    mood_buff: 0,
  },

  // Баффы
  {
    id: 10,
    name: 'Ускоритель',
    category: 'buff',
    price: 200,
    icon: '⚡',
    description: 'x2 опыт на 1 час',
    mood_buff: 0,
  },
  {
    id: 11,
    name: 'Щит',
    category: 'buff',
    price: 150,
    icon: '🛡️',
    description: 'Нет штрафа за ошибки на 30 мин',
    mood_buff: 0,
  },
  {
    id: 12,
    name: 'Удвоитель',
    category: 'buff',
    price: 250,
    icon: '✨',
    description: 'x2 монеты за урок',
    mood_buff: 0,
  },

  // Скины
  {
    id: 13,
    name: 'Золотой скин',
    category: 'skin',
    price: 500,
    icon: '✨',
    description: 'Золотая рамка для питомца',
    mood_buff: 0,
  },
  {
    id: 14,
    name: 'Космо-скин',
    category: 'skin',
    price: 400,
    icon: '🚀',
    description: 'Космический фон для комнаты',
    mood_buff: 0,
  },
  {
    id: 15,
    name: 'Неон-скин',
    category: 'skin',
    price: 350,
    icon: '💫',
    description: 'Неоновое свечение',
    mood_buff: 0,
  },
];

interface ShopState {
  ownedItems: { [itemId: number]: number }; // itemId -> quantity
  placedDecor: number[]; // массив ID размещённого декора

  // Actions
  purchaseItem: (itemId: number, quantity?: number) => { success: boolean; message: string };
  placeDecor: (itemId: number) => void;
  removeDecor: (itemId: number) => void;
  getOwnedItems: () => (ShopItem & { quantity: number })[];
  getPlacedDecor: () => ShopItem[];
  getTotalMoodBuff: () => number;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      ownedItems: {},
      placedDecor: [],

      purchaseItem: (itemId, quantity = 1) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item) {
          return { success: false, message: 'Товар не найден' };
        }

        const { user } = useUserStore.getState();
        if (!user) {
          return { success: false, message: 'Пользователь не найден' };
        }

        const totalCost = item.price * quantity;
        if (user.liquid_balance < totalCost) {
          return { success: false, message: 'Недостаточно монет' };
        }

        // Списываем монеты
        useUserStore.getState().updateBalance(user.liquid_balance - totalCost);

        // Добавляем товар в инвентарь
        const { ownedItems } = get();
        const currentQuantity = ownedItems[itemId] || 0;

        set({
          ownedItems: {
            ...ownedItems,
            [itemId]: currentQuantity + quantity,
          },
        });

        return { success: true, message: `Куплено: ${item.name} x${quantity}` };
      },

      placeDecor: (itemId) => {
        const { placedDecor, ownedItems } = get();
        if (!ownedItems[itemId] || ownedItems[itemId] < 1) {
          return;
        }

        if (placedDecor.includes(itemId)) {
          return; // Уже размещено
        }

        set({
          placedDecor: [...placedDecor, itemId],
        });
      },

      removeDecor: (itemId) => {
        const { placedDecor } = get();
        set({
          placedDecor: placedDecor.filter((id) => id !== itemId),
        });
      },

      getOwnedItems: () => {
        const { ownedItems } = get();
        return SHOP_CATALOG.filter((item) => ownedItems[item.id] > 0).map((item) => ({
          ...item,
          quantity: ownedItems[item.id],
        }));
      },

      getPlacedDecor: () => {
        const { placedDecor } = get();
        return SHOP_CATALOG.filter((item) => placedDecor.includes(item.id));
      },

      getTotalMoodBuff: () => {
        const { placedDecor } = get();
        return placedDecor.reduce((total, itemId) => {
          const item = SHOP_CATALOG.find((i) => i.id === itemId);
          return total + (item?.mood_buff || 0);
        }, 0);
      },
    }),
    {
      name: 'finsputnik-shop-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useShop() {
  return useShopStore();
}
