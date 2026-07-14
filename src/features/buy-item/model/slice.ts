import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { mockShopItems } from '@/shared/config/mockData';
import { createTransaction } from '@/entities/wallet';

export interface ShopSlice {
  buyItem: (itemId: string) => boolean;
  useItem: (itemId: string) => void;
}

export const createShopSlice: StateCreator<GameStore, [], [], ShopSlice> = (set, get) => ({
  buyItem: (itemId) => {
    const state = get();
    const shopItem = mockShopItems.find((i) => i.id === itemId);
    if (!shopItem) return false;

    if (state.finances.coins < shopItem.price) return false;

    const existingItem = state.inventory.find((i) => i.itemId === itemId);
    const newInventory = existingItem
      ? state.inventory.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i))
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
        createTransaction('spend', shopItem.price, `Покупка: ${shopItem.name}`, shopItem.category),
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
});
