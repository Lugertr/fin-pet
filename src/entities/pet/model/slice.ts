import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import type { Pet, PetType } from '@/entities/pet';
import { createPet, calculateEnergyRestore, MAX_ACCESSORIES } from '@/entities/pet';
import { mockShopItems } from '@/shared/config/mockData';

export interface PetSlice {
  pet: Pet | null;
  isOnboarded: boolean;
  lastRewardAnimation: {
    type: 'coins' | 'achievement' | 'level_up';
    value: number | string;
    timestamp: number;
  } | null;

  createPet: (type: PetType, name: string, color: string) => void;
  feedPet: (itemId: string) => void;
  playWithPet: (itemId: string) => void;
  equipAccessory: (itemId: string) => void;
  unequipAccessory: (itemId: string) => void;
  restoreEnergy: () => void;
  clearRewardAnimation: () => void;
}

export const createPetSlice: StateCreator<GameStore, [], [], PetSlice> = (set, get) => ({
  pet: null,
  isOnboarded: false,
  lastRewardAnimation: null,

  createPet: (type, name, color) => {
    set({ pet: createPet(type, name, color), isOnboarded: true });
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

    const updates = calculateEnergyRestore(state.pet);
    if (Object.keys(updates).length === 0) return;

    set({ pet: { ...state.pet, ...updates } });
  },

  clearRewardAnimation: () => {
    set({ lastRewardAnimation: null });
  },
});
