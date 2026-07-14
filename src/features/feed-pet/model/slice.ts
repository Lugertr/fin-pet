import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';

export interface FeedPetSlice {}

export const createFeedPetSlice: StateCreator<GameStore, [], [], FeedPetSlice> = () => ({
  // feedPet is in PetSlice since it modifies pet state
});
