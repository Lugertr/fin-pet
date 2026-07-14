import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { createTransaction } from '@/entities/wallet';

export interface PiggyBankSlice {
  piggyBank: import('@/entities/piggy-bank').PiggyBank;
  saveCoins: (amount: number) => void;
  withdrawSavings: (amount: number) => void;
}

export const createPiggyBankSlice: StateCreator<GameStore, [], [], PiggyBankSlice> = (
  set,
  get
) => ({
  piggyBank: {
    balance: 0,
    interestRate: 0.05,
    lastInterestCalculatedAt: new Date().toISOString(),
  },

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
      transactions: [...state.transactions, createTransaction('withdraw', amount, 'Из копилки')],
    });
  },
});
