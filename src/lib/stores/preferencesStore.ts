// lib/stores/preferencesStore.ts
// Store для пользовательских предпочтений (питомец, онбординг, настройки звука/вибрации/уведомлений).
// «Приоритетная ветка» (выбор на онбординге) отсюда убрана — заменена веткой
// текущего/последнего «Приключения», см. adventureStore.isActiveBranch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PreferencesState {
  // Тип питомца (робот, медведь, кот)
  petType: 'robot' | 'bear' | 'cat';
  // Имя питомца
  petName: string;
  // Пройден ли онбординг
  hasCompletedOnboarding: boolean;
  // Экран «Настройки»: раньше жили только в useState модалки и сбрасывались
  // при каждом открытии/перезапуске. Применяются к сервисам через
  // lib/settings/useApplySettings (стор не импортирует сервисы).
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;

  // Actions
  setPetType: (type: 'robot' | 'bear' | 'cat') => void;
  setPetName: (name: string) => void;
  setSoundsEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  completeOnboarding: () => void;
  resetPreferences: () => void;
}

const DEFAULT_PET_TYPE = 'robot';
const DEFAULT_PET_NAME = 'Помощник';

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      petType: DEFAULT_PET_TYPE,
      petName: DEFAULT_PET_NAME,
      hasCompletedOnboarding: false,
      soundsEnabled: true,
      hapticsEnabled: true,
      notificationsEnabled: true,

      setPetType: (type) => {
        set({ petType: type });
      },

      setPetName: (name) => {
        set({ petName: name });
      },

      setSoundsEnabled: (value) => set({ soundsEnabled: value }),
      setHapticsEnabled: (value) => set({ hapticsEnabled: value }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      resetPreferences: () => {
        set({
          petType: DEFAULT_PET_TYPE,
          petName: DEFAULT_PET_NAME,
          hasCompletedOnboarding: false,
          soundsEnabled: true,
          hapticsEnabled: true,
          notificationsEnabled: true,
        });
      },
    }),
    {
      name: 'finsputnik-preferences-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
