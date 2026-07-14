import type { Pet, PetType } from './types';
import { PET_STAGE_NAMES } from './types';

export function createPet(type: PetType, name: string, color: string): Pet {
  return {
    id: `pet_${Date.now()}`,
    type,
    name,
    color,
    level: 1,
    experience: 0,
    stage: 1,
    hunger: 80,
    happiness: 80,
    energy: 100,
    accessories: [],
    roomDecorations: [],
    createdAt: new Date().toISOString(),
    lastFedAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    lastStatusUpdateAt: new Date().toISOString(),
  };
}

export function getStageName(stage: number): string {
  return PET_STAGE_NAMES[stage] || 'Яйцо';
}

export function calculateEnergyRestore(pet: Pet): Partial<Pet> {
  const now = new Date();
  const lastUpdate = new Date(pet.lastStatusUpdateAt);
  const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  if (hoursPassed < 1) return {};

  const energyRestore = Math.floor(hoursPassed * 10);
  const hungerDecay = Math.floor(hoursPassed * 1);
  const happinessDecay = Math.floor(hoursPassed * 1);

  return {
    energy: Math.min(100, pet.energy + energyRestore),
    hunger: Math.max(0, pet.hunger - hungerDecay),
    happiness: Math.max(0, pet.happiness - happinessDecay),
    lastStatusUpdateAt: now.toISOString(),
  };
}

export function calculateLevelUp(
  pet: Pet,
  xpGained: number
): { level: number; stage: number; leveledUp: boolean } {
  const newExperience = pet.experience + xpGained;
  const newLevel = Math.floor(newExperience / 100) + pet.level;
  const leveledUp = newLevel > pet.level;
  const stage = Math.min(5, Math.floor((newLevel - 1) / 2) + 1);

  return { level: newLevel, stage, leveledUp };
}

export function isValidPetName(name: string): boolean {
  return name.length >= 3 && name.length <= 15;
}
