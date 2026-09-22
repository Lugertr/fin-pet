// domain/repositories/SavingsRepository.ts

import { SavingsRecord, SavingsTransactionRecord } from '@/domain/savings/Savings';

export interface SavingsRepository {
  getByProfileId(profileId: string): Promise<SavingsRecord | null>;
  create(profileId: string, bonusRate: number): Promise<SavingsRecord>;
  update(record: SavingsRecord): Promise<void>;
  addTransaction(
    entry: Omit<SavingsTransactionRecord, 'id' | 'createdAt'>
  ): Promise<SavingsTransactionRecord>;
  listTransactions(savingsId: number, limit?: number): Promise<SavingsTransactionRecord[]>;
  /** §17.2 «Сброс профиля» — очищает историю накоплений, сама запись savings остаётся. */
  clearTransactions(savingsId: number): Promise<void>;
}
