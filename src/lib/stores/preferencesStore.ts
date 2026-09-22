// lib/stores/preferencesStore.ts
// Store для пользовательских предпочтений (приоритетные ветки, настройки)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PreferencesState {
  // Приоритетные ветки (выбираются в онбординге)
  priorityBranches: number[];
  // Тип питомца (робот, дракон, кот)
  petType: 'robot' | 'dragon' | 'cat';
  // Имя питомца
  petName: string;
  // Пройден ли онбординг
  hasCompletedOnboarding: boolean;
  // §10.3 — ветки, исключённые из случайного выбора Аркады
  excludedTrainerBranches: number[];

  // Actions
  setPriorityBranches: (branches: number[]) => void;
  addPriorityBranch: (branchId: number) => void;
  removePriorityBranch: (branchId: number) => void;
  isPriorityBranch: (branchId: number) => boolean;
  toggleExcludedTrainerBranch: (branchId: number) => void;
  isTrainerBranchExcluded: (branchId: number) => boolean;
  setPetType: (type: 'robot' | 'dragon' | 'cat') => void;
  setPetName: (name: string) => void;
  completeOnboarding: () => void;
  resetPreferences: () => void;
}

const DEFAULT_PET_TYPE = 'robot';
const DEFAULT_PET_NAME = 'Помощник';
const MAX_PRIORITY_BRANCHES = 3;

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      priorityBranches: [],
      petType: DEFAULT_PET_TYPE,
      petName: DEFAULT_PET_NAME,
      hasCompletedOnboarding: false,
      excludedTrainerBranches: [],

      setPriorityBranches: (branches) => {
        set({ priorityBranches: branches.slice(0, MAX_PRIORITY_BRANCHES) });
      },

      addPriorityBranch: (branchId) => {
        const { priorityBranches } = get();
        if (priorityBranches.includes(branchId)) return;
        if (priorityBranches.length >= MAX_PRIORITY_BRANCHES) return;
        set({ priorityBranches: [...priorityBranches, branchId] });
      },

      removePriorityBranch: (branchId) => {
        const { priorityBranches } = get();
        set({ priorityBranches: priorityBranches.filter((id) => id !== branchId) });
      },

      isPriorityBranch: (branchId) => {
        return get().priorityBranches.includes(branchId);
      },

      toggleExcludedTrainerBranch: (branchId) => {
        const { excludedTrainerBranches } = get();
        set({
          excludedTrainerBranches: excludedTrainerBranches.includes(branchId)
            ? excludedTrainerBranches.filter((id) => id !== branchId)
            : [...excludedTrainerBranches, branchId],
        });
      },

      isTrainerBranchExcluded: (branchId) => {
        return get().excludedTrainerBranches.includes(branchId);
      },

      setPetType: (type) => {
        set({ petType: type });
      },

      setPetName: (name) => {
        set({ petName: name });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      resetPreferences: () => {
        set({
          priorityBranches: [],
          petType: DEFAULT_PET_TYPE,
          petName: DEFAULT_PET_NAME,
          hasCompletedOnboarding: false,
          excludedTrainerBranches: [],
        });
      },
    }),
    {
      name: 'finsputnik-preferences-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function usePreferences() {
  return usePreferencesStore();
}
