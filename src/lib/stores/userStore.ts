// lib/stores/userStore.ts
// Глобальное состояние пользователя

import { getProfileRepository, getTransactionRepository } from '@/data/local/repositories';
import { Pet, TransactionType, User } from '@/types/models';
import { create } from 'zustand';
import { useLifetimeStatsStore } from './lifetimeStatsStore';

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
  /** Изменяет баланс на delta и пишет запись в леджер транзакций (SQLite). */
  recordTransaction: (
    amount: number,
    transactionType: TransactionType,
    description?: string
  ) => void;
  setNetWorth: (value: number) => void;
  setLoading: (value: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
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

  updateBalance: (newBalance) => {
    set((state) => ({
      user: state.user ? { ...state.user, liquid_balance: newBalance } : null,
    }));

    const { user } = get();
    if (user) {
      getProfileRepository()
        .updateBalance(user.id, newBalance)
        .catch((error) => console.warn('[UserStore] Не удалось сохранить баланс:', error));
    }
  },

  recordTransaction: (amount, transactionType, description) => {
    const { user, updateBalance } = get();
    if (!user) return;

    const newBalance = user.liquid_balance + amount;
    updateBalance(newBalance);
    if (amount > 0) {
      useLifetimeStatsStore.getState().recordCoinsEarned(amount);
    }

    getTransactionRepository()
      .add({
        profileId: user.id,
        amount,
        transactionType,
        description: description ?? null,
      })
      .catch((error) => console.warn('[UserStore] Не удалось записать транзакцию:', error));
  },

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
