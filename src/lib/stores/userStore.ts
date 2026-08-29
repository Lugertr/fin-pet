// lib/stores/userStore.ts
// Глобальное состояние пользователя

import { Pet, User } from '@/types/models';
import { create } from 'zustand';

interface UserState {
  // Данные
  user: User | null;
  pet: Pet | null;
  totalNetWorth: number;
  isOnboarded: boolean;
  isLoading: boolean;

  // Действия
  setUser: (user: User) => void;
  setPet: (pet: Pet) => void;
  setOnboarded: (value: boolean) => void;
  updateBalance: (newBalance: number) => void;
  setNetWorth: (value: number) => void;
  setLoading: (value: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // Начальное состояние
  user: null,
  pet: null,
  totalNetWorth: 0,
  isOnboarded: false,
  isLoading: true,

  // Действия
  setUser: (user) => set({ user }),

  setPet: (pet) => set({ pet }),

  setOnboarded: (value) => set({ isOnboarded: value }),

  updateBalance: (newBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, liquid_balance: newBalance } : null,
    })),

  setNetWorth: (value) => set({ totalNetWorth: value }),

  setLoading: (value) => set({ isLoading: value }),

  reset: () =>
    set({
      user: null,
      pet: null,
      totalNetWorth: 0,
      isOnboarded: false,
      isLoading: true,
    }),
}));
