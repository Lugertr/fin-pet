import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { mockAdventures } from '@/shared/config/mockData';
import { createTransaction } from '@/entities/wallet';
import { calculateAdventureReward } from '@/entities/adventure';

export interface AdventureSlice {
  activeAdventure: import('@/entities/adventure').ActiveAdventure | null;
  startAdventure: (adventureId: string) => boolean;
  completeAdventure: () => number | null;
}

export const createAdventureSlice: StateCreator<GameStore, [], [], AdventureSlice> = (
  set,
  get
) => ({
  activeAdventure: null,

  startAdventure: (adventureId) => {
    const state = get();
    if (!state.pet) return false;
    if (state.activeAdventure) return false;

    const adventure = mockAdventures.find((a) => a.id === adventureId);
    if (!adventure) return false;

    if (state.pet.level < adventure.levelRequirement) return false;
    if (state.pet.energy < adventure.energyCost) return false;

    const now = new Date();
    const endsAt = new Date(now.getTime() + adventure.duration * 60 * 60 * 1000);

    set({
      pet: {
        ...state.pet,
        energy: state.pet.energy - adventure.energyCost,
      },
      activeAdventure: {
        adventureId,
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
      },
    });

    return true;
  },

  completeAdventure: () => {
    const state = get();
    if (!state.activeAdventure) return null;

    const now = new Date();
    const endsAt = new Date(state.activeAdventure.endsAt);
    if (now < endsAt) return null;

    const adventure = mockAdventures.find((a) => a.id === state.activeAdventure!.adventureId);
    if (!adventure) return null;

    const reward = calculateAdventureReward(adventure.minReward, adventure.maxReward);

    set({
      finances: {
        ...state.finances,
        coins: state.finances.coins + reward,
        totalEarned: state.finances.totalEarned + reward,
      },
      pet: state.pet
        ? {
            ...state.pet,
            energy: Math.min(100, state.pet.energy + 10),
          }
        : null,
      activeAdventure: null,
      transactions: [
        ...state.transactions,
        createTransaction('earn', reward, `Приключение: ${adventure.name}`, adventure.category),
      ],
      lastRewardAnimation: {
        type: 'coins',
        value: reward,
        timestamp: Date.now(),
      },
    });

    return reward;
  },
});
