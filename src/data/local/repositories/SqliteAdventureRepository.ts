// data/local/repositories/SqliteAdventureRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import { AdventureAllocation, AdventureRecord, BudgetCategory } from '@/domain/adventure/Adventure';
import { AdventureRepository } from '@/domain/repositories/AdventureRepository';

interface AdventureRow {
  id: number;
  profile_id: string;
  adventure_number: number;
  status: string;
  branch_id: number | null;
  lesson_id: number | null;
  projected_income: number;
  budget: number;
  plan_mandatory: number;
  plan_optional: number;
  plan_savings: number;
  fact_mandatory: number;
  fact_optional: number;
  fact_savings: number;
  started_at: string | null;
  planned_end_at: string | null;
  completed_at: string | null;
  xp_awarded: number | null;
  pending_summary?: string | null;
}

function rowToAdventure(row: AdventureRow): AdventureRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    adventureNumber: row.adventure_number,
    status: row.status as AdventureRecord['status'],
    branchId: row.branch_id,
    lessonId: row.lesson_id ?? null,
    projectedIncome: row.projected_income,
    budget: row.budget ?? 0,
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
    plannedEndAt: row.planned_end_at,
    completedAt: row.completed_at,
    xpAwarded: row.xp_awarded,
  };
}

const FACT_COLUMN: Record<BudgetCategory, string> = {
  mandatory: 'fact_mandatory',
  optional: 'fact_optional',
  savings: 'fact_savings',
};

export class SqliteAdventureRepository implements AdventureRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async getCurrent(profileId: string): Promise<AdventureRecord | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<AdventureRow>(
      `SELECT * FROM adventures WHERE profile_id = ? AND status != 'completed'
       ORDER BY adventure_number DESC LIMIT 1`,
      [profileId]
    );
    return row ? rowToAdventure(row) : null;
  }

  async getHistory(profileId: string, limit = 20): Promise<AdventureRecord[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<AdventureRow>(
      `SELECT * FROM adventures WHERE profile_id = ? ORDER BY adventure_number DESC LIMIT ?`,
      [profileId, limit]
    );
    return rows.map(rowToAdventure);
  }

  async create(record: Omit<AdventureRecord, 'id'>): Promise<AdventureRecord> {
    const db = await this.getDb();
    const result = await db.runAsync(
      `INSERT INTO adventures
        (profile_id, adventure_number, status, branch_id, projected_income,
         plan_mandatory, plan_optional, plan_savings,
         fact_mandatory, fact_optional, fact_savings,
         started_at, planned_end_at, completed_at, xp_awarded,
         created_at, budget, lesson_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.profileId,
        record.adventureNumber,
        record.status,
        record.branchId,
        record.projectedIncome,
        record.plan.mandatory,
        record.plan.optional,
        record.plan.savings,
        record.fact.mandatory,
        record.fact.optional,
        record.fact.savings,
        record.startedAt,
        record.plannedEndAt,
        record.completedAt,
        record.xpAwarded,
        new Date().toISOString(),
        record.budget,
        record.lessonId,
      ]
    );
    return { id: result.lastInsertRowId, ...record };
  }

  async setPlan(id: number, branchId: number, plan: AdventureAllocation): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'UPDATE adventures SET branch_id = ?, plan_mandatory = ?, plan_optional = ?, plan_savings = ? WHERE id = ?',
      [branchId, plan.mandatory, plan.optional, plan.savings, id]
    );
  }

  async activate(
    id: number,
    startedAt: string,
    plannedEndAt: string,
    budget: number,
    lessonId: number
  ): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE adventures
       SET status = 'active', started_at = ?, planned_end_at = ?, budget = ?, lesson_id = ?
       WHERE id = ?`,
      [startedAt, plannedEndAt, budget, lessonId, id]
    );
  }

  async setBudget(id: number, budget: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('UPDATE adventures SET budget = ? WHERE id = ?', [budget, id]);
  }

  async addFact(id: number, category: BudgetCategory, amount: number): Promise<void> {
    const db = await this.getDb();
    const column = FACT_COLUMN[category];
    await db.runAsync(`UPDATE adventures SET ${column} = ${column} + ? WHERE id = ?`, [amount, id]);
  }

  async logEvent(
    adventureId: number,
    templateId: string,
    optionId: string,
    category: BudgetCategory | null,
    coinAmount: number,
    timeDeltaMs: number,
    resolvedAt: string
  ): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT INTO adventure_event_log
        (adventure_id, template_id, option_id, category, coin_amount, time_delta_ms, resolved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [adventureId, templateId, optionId, category, coinAmount, timeDeltaMs, resolvedAt]
    );
  }

  async countResolvedEvents(profileId: string): Promise<number> {
    const db = await this.getDb();
    // option_id 'expired' — событие снято автозавершением, решения не было.
    const row = await db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) AS total FROM adventure_event_log l
       JOIN adventures a ON a.id = l.adventure_id
       WHERE a.profile_id = ? AND l.option_id != 'expired'`,
      [profileId]
    );
    return row?.total ?? 0;
  }

  async complete(id: number, completedAt: string, xpAwarded: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      "UPDATE adventures SET status = 'completed', completed_at = ?, xp_awarded = ? WHERE id = ?",
      [completedAt, xpAwarded, id]
    );
  }

  async setPendingSummary(id: number, summaryJson: string | null): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('UPDATE adventures SET pending_summary = ? WHERE id = ?', [summaryJson, id]);
  }

  async getPendingSummary(
    profileId: string
  ): Promise<{ adventure: AdventureRecord; summaryJson: string } | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<AdventureRow>(
      `SELECT * FROM adventures
       WHERE profile_id = ? AND status = 'completed' AND pending_summary IS NOT NULL
       ORDER BY adventure_number DESC LIMIT 1`,
      [profileId]
    );
    if (!row?.pending_summary) return null;
    return { adventure: rowToAdventure(row), summaryJson: row.pending_summary };
  }

  async deleteAllForProfile(profileId: string): Promise<void> {
    const db = await this.getDb();
    // adventure_event_log.adventure_id REFERENCES adventures(id) без ON DELETE
    // CASCADE, а foreign_keys=ON (см. database.ts) — удаление приключений,
    // у которых уже есть залогированные события, без этого шага упало бы с
    // нарушением внешнего ключа.
    await db.runAsync(
      'DELETE FROM adventure_event_log WHERE adventure_id IN (SELECT id FROM adventures WHERE profile_id = ?)',
      [profileId]
    );
    await db.runAsync('DELETE FROM adventures WHERE profile_id = ?', [profileId]);
  }
}
