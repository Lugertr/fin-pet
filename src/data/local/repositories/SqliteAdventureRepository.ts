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
  time_adjustment_ms: number;
  quests_completed: number;
  xp_awarded: number | null;
  pending_event_template_id: string | null;
  pending_event_rolled_at: string | null;
  next_event_check_at: string | null;
}

function rowToAdventure(row: AdventureRow): AdventureRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    adventureNumber: row.adventure_number,
    status: row.status as AdventureRecord['status'],
    branchId: row.branch_id,
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
    timeAdjustmentMs: row.time_adjustment_ms,
    questsCompleted: row.quests_completed,
    xpAwarded: row.xp_awarded,
    pendingEventTemplateId: row.pending_event_template_id,
    pendingEventRolledAt: row.pending_event_rolled_at,
    nextEventCheckAt: row.next_event_check_at,
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
         started_at, planned_end_at, completed_at, time_adjustment_ms,
         quests_completed, xp_awarded,
         pending_event_template_id, pending_event_rolled_at, next_event_check_at,
         created_at, budget)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        record.timeAdjustmentMs,
        record.questsCompleted,
        record.xpAwarded,
        record.pendingEventTemplateId,
        record.pendingEventRolledAt,
        record.nextEventCheckAt,
        new Date().toISOString(),
        record.budget,
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
    nextEventCheckAt: string,
    budget: number
  ): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE adventures
       SET status = 'active', started_at = ?, planned_end_at = ?, next_event_check_at = ?, budget = ?
       WHERE id = ?`,
      [startedAt, plannedEndAt, nextEventCheckAt, budget, id]
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

  async adjustTime(id: number, plannedEndAt: string, timeAdjustmentMs: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'UPDATE adventures SET planned_end_at = ?, time_adjustment_ms = ? WHERE id = ?',
      [plannedEndAt, timeAdjustmentMs, id]
    );
  }

  async incrementQuestsCompleted(id: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'UPDATE adventures SET quests_completed = quests_completed + 1 WHERE id = ?',
      [id]
    );
  }

  async rollEvent(id: number, templateId: string, rolledAt: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'UPDATE adventures SET pending_event_template_id = ?, pending_event_rolled_at = ? WHERE id = ?',
      [templateId, rolledAt, id]
    );
  }

  async resolveEvent(id: number, nextEventCheckAt: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE adventures
       SET pending_event_template_id = NULL, pending_event_rolled_at = NULL, next_event_check_at = ?
       WHERE id = ?`,
      [nextEventCheckAt, id]
    );
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

  async getEventTemplateIds(adventureId: number): Promise<string[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<{ template_id: string }>(
      'SELECT template_id FROM adventure_event_log WHERE adventure_id = ? ORDER BY id',
      [adventureId]
    );
    return rows.map((row) => row.template_id);
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
