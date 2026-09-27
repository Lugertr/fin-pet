// domain/pet/petSpeciesRegistry.ts
// Точка расширения: новый вид питомца = новый класс + одна строка здесь.

import { PetType } from '@/constants/petAssets';
import { PetSpecies } from './Pet';
import { RobotPet } from './species/RobotPet';
import { BearPet } from './species/BearPet';
import { CatPet } from './species/CatPet';

const REGISTRY: Record<PetType, PetSpecies> = {
  robot: new RobotPet(),
  bear: new BearPet(),
  cat: new CatPet(),
};

export function getPetSpecies(type: PetType): PetSpecies {
  return REGISTRY[type];
}
