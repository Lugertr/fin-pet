// lib/stores/petStore.ts
// Состояние питомца с ленивым вычислением настроения

import { calculateCurrentMood } from '@/lib/utils/moodCalculator';
import { Pet } from '@/types/models';
import { create } from 'zustand';

interface PetState {
  // Данные
  pet: Pet | null;
  currentMood: number;
  moodBuffs: number; // баффы от декора
  lastFetchedAt: number | null; // timestamp последнего запроса

  // Действия
  setPet: (pet: Pet) => void;
  setMoodBuffs: (buffs: number) => void;
  refreshMood: () => void;
  applyPenalty: (penalty: number) => void;
  updateFromServer: (pet: Pet, serverMood: number) => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pet: null,
  currentMood: 100,
  moodBuffs: 0,
  lastFetchedAt: null,

  setPet: (pet) => {
    const { moodBuffs } = get();
    const result = calculateCurrentMood({
      storedMood: pet.mood,
      lastUpdatedAt: pet.last_mood_updated_at,
      baseRecoveryRate: pet.base_recovery_rate,
      inventoryBuffs: moodBuffs,
    });

    set({
      pet,
      currentMood: result.currentMood,
      lastFetchedAt: Date.now(),
    });
  },

  setMoodBuffs: (buffs) => {
    const { pet } = get();
    if (pet) {
      const result = calculateCurrentMood({
        storedMood: pet.mood,
        lastUpdatedAt: pet.last_mood_updated_at,
        baseRecoveryRate: pet.base_recovery_rate,
        inventoryBuffs: buffs,
      });
      set({ moodBuffs: buffs, currentMood: result.currentMood });
    } else {
      set({ moodBuffs: buffs });
    }
  },

  /**
   * Пересчитывает настроение на клиенте
   * (вызывается по таймеру или при фокусе экрана)
   */
  refreshMood: () => {
    const { pet, moodBuffs } = get();
    if (!pet) return;

    const result = calculateCurrentMood({
      storedMood: pet.mood,
      lastUpdatedAt: pet.last_mood_updated_at,
      baseRecoveryRate: pet.base_recovery_rate,
      inventoryBuffs: moodBuffs,
    });

    set({ currentMood: result.currentMood });
  },

  /**
   * Применяет штраф к настроению (оптимистично)
   * Используется после ошибки в мини-игре
   */
  applyPenalty: (penalty) => {
    const { currentMood } = get();
    set({ currentMood: Math.max(0, currentMood - penalty) });
  },

  /**
   * Обновляет данные с сервера
   * Сервер является источником истины
   */
  updateFromServer: (pet, serverMood) => {
    set({
      pet,
      currentMood: serverMood,
      lastFetchedAt: Date.now(),
    });
  },
}));
