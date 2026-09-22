// lib/stores/petProgressStore.ts
// Рост питомца по совокупности успешных периодов (§8 ТЗ).

import { getPetProgressRepository } from '@/data/local/repositories';
import { PetProgressRecord, computeStageForCount } from '@/domain/pet/PetProgress';
import { create } from 'zustand';

export interface StageUpResult {
  from: number;
  to: number;
}

interface PetProgressState {
  progress: PetProgressRecord | null;
  isLoading: boolean;

  loadOrCreate: (profileId: string) => Promise<void>;
  /** Вызывается periodStore при завершении успешного периода. Возвращает переход стадии, если он случился. */
  registerSuccessfulPeriod: () => Promise<StageUpResult | null>;
  reset: () => void;
}

export const usePetProgressStore = create<PetProgressState>((set, get) => ({
  progress: null,
  isLoading: true,

  loadOrCreate: async (profileId) => {
    set({ isLoading: true });
    try {
      const repo = getPetProgressRepository();
      let progress = await repo.getByProfileId(profileId);
      if (!progress) {
        progress = await repo.create(profileId);
      }
      set({ progress, isLoading: false });
    } catch (error) {
      console.error('[PetProgressStore] Не удалось загрузить прогресс питомца:', error);
      set({ isLoading: false });
    }
  },

  registerSuccessfulPeriod: async () => {
    let { progress } = get();

    // На случай, если store ещё не успел загрузиться к моменту завершения периода
    if (!progress) return null;

    const newCount = progress.successfulPeriodsCount + 1;
    const previousStage = progress.currentStage;
    const newStage = computeStageForCount(newCount);

    await getPetProgressRepository().update(progress.id, newCount, newStage);

    progress = { ...progress, successfulPeriodsCount: newCount, currentStage: newStage };
    set({ progress });

    return newStage > previousStage ? { from: previousStage, to: newStage } : null;
  },

  reset: () => set({ progress: null, isLoading: true }),
}));
