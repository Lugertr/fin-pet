// data/local/repositories/SqliteSavingsRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import { SavingsRecord, SavingsTransactionRecord } from '@/domain/savings/Savings';
import { SavingsRepository } from '@/domain/repositories/SavingsRepository';

interface SavingsRow {
  id: number;
  profile_id: string;
  current_amount: number;
  bonus_rate: number;
  target_item_id: number | null;
  periods_since_withdrawal: number;
}

interface SavingsTransactionRow {
  id: number;
  savings_id: number;
  operation_type: string;
  amount: number;
  balance_after: number;
  period_id: number | null;
  created_at: string;
}

function rowToRecord(row: SavingsRow): SavingsRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    currentAmount: row.current_amount,
    bonusRate: row.bonus_rate,
    targetItemId: row.target_item_id,
    periodsSinceWithdrawal: row.periods_since_withdrawal,
  };
}

function rowToTransaction(row: SavingsTransactionRow): SavingsTransactionRecord {
  return {
    id: row.id,
    savingsId: row.savings_id,
    operationType: row.operation_type as SavingsTransactionRecord['operationType'],
    amount: row.amount,
    balanceAfter: row.balance_after,
    periodId: row.period_id,
    createdAt: row.created_at,
  };
}

export class SqliteSavingsRepository implements SavingsRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async getByProfileId(profileId: string): Promise<SavingsRecord | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<SavingsRow>(
      'SELECT * FROM savings WHERE profile_id = ? LIMIT 1',
      [profileId]
    );
    return row ? rowToRecord(row) : null;
  }

  async create(profileId: string, bonusRate: number): Promise<SavingsRecord> {
    const db = await this.getDb();
    const result = await db.runAsync(
      'INSERT INTO savings (profile_id, current_amount, bonus_rate, target_item_id, periods_since_withdrawal) VALUES (?, 0, ?, NULL, 0)',
      [profileId, bonusRate]
    );
    return {
      id: result.lastInsertRowId,
      profileId,
      currentAmount: 0,
      bonusRate,
      targetItemId: null,
      periodsSinceWithdrawal: 0,
    };
  }

  async update(record: SavingsRecord): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE savings SET current_amount = ?, bonus_rate = ?, target_item_id = ?, periods_since_withdrawal = ?
       WHERE id = ?`,
      [
        record.currentAmount,
        record.bonusRate,
        record.targetItemId,
        record.periodsSinceWithdrawal,
        record.id,
      ]
    );
  }

  async addTransaction(
    entry: Omit<SavingsTransactionRecord, 'id' | 'createdAt'>
  ): Promise<SavingsTransactionRecord> {
    const db = await this.getDb();
    const createdAt = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO savings_transactions (savings_id, operation_type, amount, balance_after, period_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        entry.savingsId,
        entry.operationType,
        entry.amount,
        entry.balanceAfter,
        entry.periodId,
        createdAt,
      ]
    );
    return { id: result.lastInsertRowId, createdAt, ...entry };
  }

  async listTransactions(savingsId: number, limit = 50): Promise<SavingsTransactionRecord[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<SavingsTransactionRow>(
      'SELECT * FROM savings_transactions WHERE savings_id = ? ORDER BY created_at DESC, id DESC LIMIT ?',
      [savingsId, limit]
    );
    return rows.map(rowToTransaction);
  }

  async clearTransactions(savingsId: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM savings_transactions WHERE savings_id = ?', [savingsId]);
  }
}
