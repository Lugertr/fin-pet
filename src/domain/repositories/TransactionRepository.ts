// domain/repositories/TransactionRepository.ts
// Леджер экономики: каждое движение монет обязано пройти через этот репозиторий
// (требование CLAUDE.md — "каждая транзакция должна быть записана").

import { TransactionType } from '@/types/models';

export interface TransactionRecord {
  id: number;
  profileId: string;
  amount: number; // знак = направление (+начисление / -списание)
  transactionType: TransactionType;
  description: string | null;
  createdAt: string;
}

export interface TransactionRepository {
  list(profileId: string, limit?: number): Promise<TransactionRecord[]>;
  add(entry: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord>;
  /** §17.2 «Сброс профиля» — очищает историю, не трогая сам профиль. */
  clearForProfile(profileId: string): Promise<void>;
}
