// data/local/repositories/index.ts
// Синглтон-фабрики: остальной код зависит только от доменных интерфейсов
// (@/domain/repositories/*), не от того, что под капотом SQLite.

import { getDatabase } from '../database';
import { SqliteProfileRepository } from './SqliteProfileRepository';
import { SqlitePetRepository } from './SqlitePetRepository';
import { SqliteTransactionRepository } from './SqliteTransactionRepository';
import { SqliteSavingsRepository } from './SqliteSavingsRepository';
import { SqliteAdventureRepository } from './SqliteAdventureRepository';
import { SqliteLessonProgressRepository } from './SqliteLessonProgressRepository';
import { ProfileRepository } from '@/domain/repositories/ProfileRepository';
import { PetRepository } from '@/domain/repositories/PetRepository';
import { TransactionRepository } from '@/domain/repositories/TransactionRepository';
import { SavingsRepository } from '@/domain/repositories/SavingsRepository';
import { AdventureRepository } from '@/domain/repositories/AdventureRepository';
import { LessonProgressRepository } from '@/domain/repositories/LessonProgressRepository';

let profileRepository: ProfileRepository | null = null;
let petRepository: PetRepository | null = null;
let transactionRepository: TransactionRepository | null = null;
let savingsRepository: SavingsRepository | null = null;
let adventureRepository: AdventureRepository | null = null;
let lessonProgressRepository: LessonProgressRepository | null = null;

export function getProfileRepository(): ProfileRepository {
  if (!profileRepository) profileRepository = new SqliteProfileRepository(getDatabase);
  return profileRepository;
}

export function getPetRepository(): PetRepository {
  if (!petRepository) petRepository = new SqlitePetRepository(getDatabase);
  return petRepository;
}

export function getTransactionRepository(): TransactionRepository {
  if (!transactionRepository) transactionRepository = new SqliteTransactionRepository(getDatabase);
  return transactionRepository;
}

export function getSavingsRepository(): SavingsRepository {
  if (!savingsRepository) savingsRepository = new SqliteSavingsRepository(getDatabase);
  return savingsRepository;
}

export function getAdventureRepository(): AdventureRepository {
  if (!adventureRepository) adventureRepository = new SqliteAdventureRepository(getDatabase);
  return adventureRepository;
}

export function getLessonProgressRepository(): LessonProgressRepository {
  if (!lessonProgressRepository) {
    lessonProgressRepository = new SqliteLessonProgressRepository(getDatabase);
  }
  return lessonProgressRepository;
}
