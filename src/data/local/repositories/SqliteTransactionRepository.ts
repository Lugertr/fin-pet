// data/local/repositories/SqliteTransactionRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import {
  TransactionRecord,
  TransactionRepository,
} from '@/domain/repositories/TransactionRepository';
import { TransactionType } from '@/types/models';

interface TransactionRow {
  id: number;
  profile_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

function rowToTransaction(row: TransactionRow): TransactionRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    amount: row.amount,
    transactionType: row.transaction_type as TransactionType,
    description: row.description,
    createdAt: row.created_at,
  };
}

export class SqliteTransactionRepository implements TransactionRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async list(profileId: string, limit = 50): Promise<TransactionRecord[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<TransactionRow>(
      'SELECT * FROM transactions WHERE profile_id = ? ORDER BY created_at DESC, id DESC LIMIT ?',
      [profileId, limit]
    );
    return rows.map(rowToTransaction);
  }

  async add(entry: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord> {
    const db = await this.getDb();
    const createdAt = new Date().toISOString();
    const result = await db.runAsync(
      'INSERT INTO transactions (profile_id, amount, transaction_type, description, created_at) VALUES (?, ?, ?, ?, ?)',
      [entry.profileId, entry.amount, entry.transactionType, entry.description, createdAt]
    );
    return { id: result.lastInsertRowId, createdAt, ...entry };
  }

  async clearForProfile(profileId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM transactions WHERE profile_id = ?', [profileId]);
  }
}
