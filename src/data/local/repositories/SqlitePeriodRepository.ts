// data/local/repositories/SqlitePeriodRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import { BudgetCategory, GamePeriodRecord, PeriodAllocation } from '@/domain/period/GamePeriod';
import { PeriodRepository } from '@/domain/repositories/PeriodRepository';

interface PeriodRow {
  id: number;
  profile_id: string;
  period_number: number;
  status: string;
  income_awarded: number;
  plan_mandatory: number;
  plan_optional: number;
  plan_savings: number;
  fact_mandatory: number;
  fact_optional: number;
  fact_savings: number;
  started_at: string;
  ended_at: string | null;
}

function rowToPeriod(row: PeriodRow): GamePeriodRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    periodNumber: row.period_number,
    status: row.status as GamePeriodRecord['status'],
    incomeAwarded: row.income_awarded,
    plan: {
      mandatory: row.plan_mandatory,
      optional: row.plan_optional,
      savings: row.plan_savings,
    },
    fact: {
      mandatory: row.fact_mandatory,
      optional: row.fact_optional,
      savings: row.fact_savings,
    },
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

const FACT_COLUMN: Record<BudgetCategory, string> = {
  mandatory: 'fact_mandatory',
  optional: 'fact_optional',
  savings: 'fact_savings',
};

export class SqlitePeriodRepository implements PeriodRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async getCurrent(profileId: string): Promise<GamePeriodRecord | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<PeriodRow>(
      `SELECT * FROM periods WHERE profile_id = ? AND status != 'completed'
       ORDER BY period_number DESC LIMIT 1`,
      [profileId]
    );
    return row ? rowToPeriod(row) : null;
  }

  async getHistory(profileId: string, limit = 20): Promise<GamePeriodRecord[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<PeriodRow>(
      `SELECT * FROM periods WHERE profile_id = ? ORDER BY period_number DESC LIMIT ?`,
      [profileId, limit]
    );
    return rows.map(rowToPeriod);
  }

  async create(record: Omit<GamePeriodRecord, 'id'>): Promise<GamePeriodRecord> {
    const db = await this.getDb();
    const result = await db.runAsync(
      `INSERT INTO periods
        (profile_id, period_number, status, income_awarded,
         plan_mandatory, plan_optional, plan_savings,
         fact_mandatory, fact_optional, fact_savings,
         started_at, ended_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.profileId,
        record.periodNumber,
        record.status,
        record.incomeAwarded,
        record.plan.mandatory,
        record.plan.optional,
        record.plan.savings,
        record.fact.mandatory,
        record.fact.optional,
        record.fact.savings,
        record.startedAt,
        record.endedAt,
      ]
    );
    return { id: result.lastInsertRowId, ...record };
  }

  async setPlan(id: number, plan: PeriodAllocation): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'UPDATE periods SET plan_mandatory = ?, plan_optional = ?, plan_savings = ? WHERE id = ?',
      [plan.mandatory, plan.optional, plan.savings, id]
    );
  }

  async addFact(id: number, category: BudgetCategory, amount: number): Promise<void> {
    const db = await this.getDb();
    const column = FACT_COLUMN[category];
    await db.runAsync(`UPDATE periods SET ${column} = ${column} + ? WHERE id = ?`, [amount, id]);
  }

  async activate(id: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync("UPDATE periods SET status = 'active' WHERE id = ?", [id]);
  }

  async complete(id: number, endedAt: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync("UPDATE periods SET status = 'completed', ended_at = ? WHERE id = ?", [
      endedAt,
      id,
    ]);
  }

  async deleteAllForProfile(profileId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM periods WHERE profile_id = ?', [profileId]);
  }
}
