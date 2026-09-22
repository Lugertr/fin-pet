// data/local/repositories/index.ts
// Синглтон-фабрики: остальной код зависит только от доменных интерфейсов
// (@/domain/repositories/*), не от того, что под капотом SQLite.

import { getDatabase } from '../database';
import { SqliteProfileRepository } from './SqliteProfileRepository';
import { SqlitePetRepository } from './SqlitePetRepository';
import { SqliteTransactionRepository } from './SqliteTransactionRepository';
import { SqlitePeriodRepository } from './SqlitePeriodRepository';
import { SqlitePetProgressRepository } from './SqlitePetProgressRepository';
import { SqliteSavingsRepository } from './SqliteSavingsRepository';
import { ProfileRepository } from '@/domain/repositories/ProfileRepository';
import { PetRepository } from '@/domain/repositories/PetRepository';
import { TransactionRepository } from '@/domain/repositories/TransactionRepository';
import { PeriodRepository } from '@/domain/repositories/PeriodRepository';
import { PetProgressRepository } from '@/domain/repositories/PetProgressRepository';
import { SavingsRepository } from '@/domain/repositories/SavingsRepository';

let profileRepository: ProfileRepository | null = null;
let petRepository: PetRepository | null = null;
let transactionRepository: TransactionRepository | null = null;
let periodRepository: PeriodRepository | null = null;
let petProgressRepository: PetProgressRepository | null = null;
let savingsRepository: SavingsRepository | null = null;

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

export function getPeriodRepository(): PeriodRepository {
  if (!periodRepository) periodRepository = new SqlitePeriodRepository(getDatabase);
  return periodRepository;
}

export function getPetProgressRepository(): PetProgressRepository {
  if (!petProgressRepository) petProgressRepository = new SqlitePetProgressRepository(getDatabase);
  return petProgressRepository;
}

export function getSavingsRepository(): SavingsRepository {
  if (!savingsRepository) savingsRepository = new SqliteSavingsRepository(getDatabase);
  return savingsRepository;
}
